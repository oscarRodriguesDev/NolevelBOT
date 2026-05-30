import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { registerPhone, getPhoneByCpf, removePhone } from '@/lib/phoneMap'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'phoneMap.json')

beforeEach(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE)
  }
})

afterEach(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE)
  }
})

describe('PhoneMap - registro', () => {
  it('registra e recupera telefone por CPF', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    const result = getPhoneByCpf('12345678901')
    expect(result).not.toBeNull()
    expect(result!.telefone).toBe('11999999999')
    expect(result!.instance).toBe('Hevelyn')
  })

  it('registro cria timestamp updatedAt', () => {
    registerPhone('00000000000', '11888888888', 'Test')
    const result = getPhoneByCpf('00000000000')
    expect(result!.updatedAt).toBeDefined()
    expect(new Date(result!.updatedAt).toISOString()).toBe(result!.updatedAt)
  })
})

describe('PhoneMap - CPF com formatacao', () => {
  it('busca CPF com pontos e tracos encontra registro', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    const result = getPhoneByCpf('123.456.789-01')
    expect(result).not.toBeNull()
    expect(result!.telefone).toBe('11999999999')
  })

  it('registro com CPF formatado limpa antes de salvar', () => {
    registerPhone('123.456.789-01', '11999999999', 'Hevelyn')
    const result = getPhoneByCpf('12345678901')
    expect(result).not.toBeNull()
  })
})

describe('PhoneMap - remocao', () => {
  it('remove entrada existente', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    expect(getPhoneByCpf('12345678901')).not.toBeNull()
    removePhone('12345678901')
    expect(getPhoneByCpf('12345678901')).toBeNull()
  })

  it('remocao de CPF inexistente nao lanca erro', () => {
    expect(() => removePhone('00000000000')).not.toThrow()
  })

  it('remocao com CPF formatado funciona', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    removePhone('123.456.789-01')
    expect(getPhoneByCpf('12345678901')).toBeNull()
  })
})

describe('PhoneMap - CPF vazio ou invalido', () => {
  it('registro com CPF vazio nao cria entrada', () => {
    registerPhone('', '11999999999', 'Test')
    const result = getPhoneByCpf('')
    expect(result).toBeNull()
  })

  it('busca de CPF inexistente retorna null', () => {
    const result = getPhoneByCpf('99999999999')
    expect(result).toBeNull()
  })
})

describe('PhoneMap - sobrescrita', () => {
  it('registro sobrescreve telefone anterior para mesmo CPF', () => {
    registerPhone('12345678901', '11111111111', 'InstA')
    registerPhone('12345678901', '22222222222', 'InstB')
    const result = getPhoneByCpf('12345678901')
    expect(result!.telefone).toBe('22222222222')
    expect(result!.instance).toBe('InstB')
  })
})

describe('PhoneMap - persistencia em arquivo', () => {
  it('dados persistem no arquivo JSON', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    expect(data['12345678901'].telefone).toBe('11999999999')
  })

  it('arquivo JSON contem todos os campos', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    expect(data['12345678901']).toHaveProperty('telefone')
    expect(data['12345678901']).toHaveProperty('instance')
    expect(data['12345678901']).toHaveProperty('updatedAt')
  })
})
