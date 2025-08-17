/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["reflect-metadata"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}], // Escapando el punto correctamente
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Asegura que Jest detecte estos archivos
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1", }, // Elimina .js en importaciones TS
  testMatch: ["**/?(*.)+(spec|test).ts"], // Asegura que Jest ejecute archivos con `.test.ts` o `.spec.ts`
  clearMocks: true, // Limpia automáticamente los mocks entre pruebas
};

