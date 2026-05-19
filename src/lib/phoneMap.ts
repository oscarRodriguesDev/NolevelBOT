import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'phoneMap.json');

type PhoneEntry = {
  telefone: string;
  instance: string;
  updatedAt: string;
};

function readMap(): Record<string, PhoneEntry> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Erro ao ler phoneMap:', error);
  }
  return {};
}

function writeMap(map: Record<string, PhoneEntry>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(map, null, 2));
  } catch (error) {
    console.error('Erro ao salvar phoneMap:', error);
  }
}

export function registerPhone(cpf: string, telefone: string, instance: string): void {
  const map = readMap();
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (!cpfLimpo) return;
  map[cpfLimpo] = { telefone, instance, updatedAt: new Date().toISOString() };
  writeMap(map);
  console.log(`📞 Phone registered: CPF ${cpfLimpo} -> ${telefone} (instance ${instance})`);
}

export function getPhoneByCpf(cpf: string): PhoneEntry | null {
  const map = readMap();
  const cpfLimpo = cpf.replace(/\D/g, '');
  return map[cpfLimpo] || null;
}

export function removePhone(cpf: string): void {
  const map = readMap();
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (map[cpfLimpo]) {
    delete map[cpfLimpo];
    writeMap(map);
  }
}
