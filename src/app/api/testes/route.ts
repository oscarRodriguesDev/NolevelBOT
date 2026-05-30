import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface TestAssertion {
  title: string
  status: 'passed' | 'failed'
  failureMessages: string[]
  ancestorTitles?: string[]
}

interface TestSuiteResult {
  name: string
  status: 'passed' | 'failed'
  assertionResults: TestAssertion[]
}

interface VitestReport {
  numTotalTestSuites: number
  numPassedTestSuites: number
  numFailedTestSuites: number
  numTotalTests: number
  numPassedTests: number
  numFailedTests: number
  testResults: TestSuiteResult[]
}

function categorizeTestFile(filePath: string): { group: string; icon: string; label: string } {
  if (filePath.includes('rbac')) return { group: 'rbac', icon: '🔒', label: 'Controle de Acesso (RBAC)' }
  if (filePath.includes('validation')) return { group: 'validation', icon: '✅', label: 'Validação de Entrada' }
  if (filePath.includes('phoneMap')) return { group: 'phoneMap', icon: '📞', label: 'Persistência de Dados' }
  if (filePath.includes('security')) return { group: 'security', icon: '🛡️', label: 'Segurança e Privacidade' }
  return { group: 'outros', icon: '⚙️', label: 'Outros' }
}

function buildReport(vitestData: VitestReport) {
  const categories: Record<string, { total: number; passed: number; failed: number; tests: TestAssertion[] }> = {
    rbac: { total: 0, passed: 0, failed: 0, tests: [] },
    validation: { total: 0, passed: 0, failed: 0, tests: [] },
    phoneMap: { total: 0, passed: 0, failed: 0, tests: [] },
    security: { total: 0, passed: 0, failed: 0, tests: [] },
  }

  for (const suite of vitestData.testResults || []) {
    const { group } = categorizeTestFile(suite.name)
    if (!categories[group]) continue
    for (const assertion of suite.assertionResults || []) {
      categories[group].total++
      if (assertion.status === 'passed') categories[group].passed++
      else categories[group].failed++
      categories[group].tests.push(assertion)
    }
  }

  const vulnerabilities: string[] = []
  const crashRisks: string[] = []

  if (categories.rbac.failed > 0) {
    vulnerabilities.push('🔴 Falhas no RBAC podem permitir que usuários criem ou excluam recursos sem autorização adequada.')
    crashRisks.push('⚠️ Se regras de criação/exclusão de usuários falham, a aplicação pode permitir escalada de privilégios.')
  }

  if (categories.validation.failed > 0) {
    vulnerabilities.push('🔴 Falhas na validação de entrada podem permitir dados malformados ou maliciosos no sistema.')
    crashRisks.push('⚠️ Dados inválidos (CPF, email, status) podem quebrar queries no banco ou causar erros 500.')
  }

  if (categories.phoneMap.failed > 0) {
    vulnerabilities.push('🟡 Falhas no PhoneMap podem impedir notificações WhatsApp ou causar perda de dados de contato.')
    crashRisks.push('⚠️ Se o arquivo phoneMap.json corromper, notificações proativas param de funcionar.')
  }

  if (categories.security.failed > 0) {
    vulnerabilities.push('🔴 Falhas nas políticas de segurança podem violar o multi-tenancy e expor dados entre empresas.')
    crashRisks.push('⚠️ Se a hierarquia de permissões quebrar, GOD pode perder acesso ou ATENDENTE pode ganhar acesso indevido.')
  }

  return {
    stats: {
      total: vitestData.numTotalTests || 0,
      passed: vitestData.numPassedTests || 0,
      failed: vitestData.numFailedTests || 0,
      suitesTotal: vitestData.numTotalTestSuites || 0,
      suitesPassed: vitestData.numPassedTestSuites || 0,
      suitesFailed: vitestData.numFailedTestSuites || 0,
    },
    categories,
    vulnerabilities,
    crashRisks,
    allPassed: vitestData.numFailedTests === 0 && vitestData.numTotalTests > 0,
  }
}

export async function GET() {
  try {
    const { stdout, stderr } = await execAsync(
      'npx vitest run --reporter=json --reporter=verbose 2>&1',
      {
        cwd: process.cwd(),
        timeout: 180000,
        maxBuffer: 10 * 1024 * 1024,
      }
    )

    const jsonMatch = stdout.match(/\{[\s\S]*"numTotalTestSuites"[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({
        error: 'Nao foi possivel extrair resultados JSON do vitest',
        raw: stdout.substring(0, 2000),
        stderr: stderr?.substring(0, 2000),
      }, { status: 500 })
    }

    const vitestData: VitestReport = JSON.parse(jsonMatch[0])
    const report = buildReport(vitestData)
    return NextResponse.json(report)
  } catch (error: any) {
    if (error.stdout) {
      const jsonMatch = error.stdout.match(/\{[\s\S]*"numTotalTestSuites"[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const vitestData: VitestReport = JSON.parse(jsonMatch[0])
          const report = buildReport(vitestData)
          return NextResponse.json(report)
        } catch { }
      }
    }

    return NextResponse.json({
      error: error.message || 'Erro ao executar testes',
      stderr: error.stderr?.substring(0, 2000),
    }, { status: 500 })
  }
}
