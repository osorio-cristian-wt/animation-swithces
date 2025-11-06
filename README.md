# animation-swithces

Pequeña app React (CRA) con animaciones usando Framer Motion.

## Despliegue en Cloudflare Pages

Para evitar errores de instalación y build en Cloudflare Pages:

- Se añadió `/.npmrc` con `legacy-peer-deps=true` para resolver automáticamente conflictos de peerDependencies en CI.
- Se añadió `/.nvmrc` con `20` para usar Node.js 20 en el entorno de build (Cloudflare detecta este archivo).
- Se actualizó `package.json`:
	- `main` apunta a `src/index.js`.
	- Se agregó `framer-motion` como dependencia.
	- Se estableció `engines.node: ">=18 <=20"` para señalar la versión recomendada.
- Se simplificó `.eslintrc.json` para no requerir TypeScript (el proyecto usa JS puro).

Configura tu proyecto en Cloudflare Pages con:

- Build command: `npm run build`
- Output directory: `build`
- Root directory: `/` (la raíz del repo)

## Desarrollo local

Requisitos: Node.js 18 o 20.

```powershell
npm install
npm start
```

Build de producción:

```powershell
npm run build
```

## Notas

- Si cambias a TypeScript en el futuro, añade `typescript` y `@typescript-eslint/parser` y ajusta `.eslintrc.json` en consecuencia.
