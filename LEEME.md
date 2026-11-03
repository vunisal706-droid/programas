# Programas del cole · puesta en marcha

App en `https://vunisal706-droid.github.io/central/programas/`. Usa el proyecto de Firebase
`gestorpt-7946b` (las mismas cuentas IdEA que Gestor PT y Refuerzo), en la rama `programas/`.

## Cuentas de monitores (Authentication → Users → Add user)
| Persona | Correo | Contraseña |
|---|---|---|
| Sandra | `proa.sandra@capitulaciones.local` | `proa.sandra` |
| Nuria | `proa.nuria@capitulaciones.local` | `proa.nuria` |
| Manolo | `proa.manolo@capitulaciones.local` | `proa.manolo` |

En la app entran con el usuario `proa.sandra`, `proa.nuria` o `proa.manolo`. Cada grupo se asigna a su monitor en «Editar grupo → Acceso a la app».

## Reglas de Firebase
Realtime Database → Reglas. Sustituye el bloque `"programas"` por este (o añádelo junto a `"refuerzo"`, con su coma):

```json
"programas": {
  ".read":  "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local')",
  ".write": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local')",
  "cursos": { "$c": {
    "grupos":   { ".read": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local' || auth.token.email == 'proa.sandra@capitulaciones.local' || auth.token.email == 'proa.nuria@capitulaciones.local' || auth.token.email == 'proa.manolo@capitulaciones.local')" },
    "sesiones": { ".read": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local' || auth.token.email == 'proa.sandra@capitulaciones.local' || auth.token.email == 'proa.nuria@capitulaciones.local' || auth.token.email == 'proa.manolo@capitulaciones.local')", ".write": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local' || auth.token.email == 'proa.sandra@capitulaciones.local' || auth.token.email == 'proa.nuria@capitulaciones.local' || auth.token.email == 'proa.manolo@capitulaciones.local')" },
    "informes": { ".read": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local' || auth.token.email == 'proa.sandra@capitulaciones.local' || auth.token.email == 'proa.nuria@capitulaciones.local' || auth.token.email == 'proa.manolo@capitulaciones.local')", ".write": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local' || auth.token.email == 'proa.sandra@capitulaciones.local' || auth.token.email == 'proa.nuria@capitulaciones.local' || auth.token.email == 'proa.manolo@capitulaciones.local')" }
  } }
}
```

## Reuniones públicas (calendario y Tablón)
Añade también este bloque junto a `"programas"` para que las reuniones marcadas salgan en el calendario del profesorado y en el Tablón (solo fecha, hora y tipo; sin alumnado ni acuerdos):

```json
"programas_publico": {
  ".read": true,
  ".write": "auth != null && (auth.token.email == 'vunisal706@capitulaciones.local' || auth.token.email == 'mrodrod323@capitulaciones.local' || auth.token.email == 'emunrom369@capitulaciones.local' || auth.token.email == 'mromrod681@capitulaciones.local' || auth.token.email == 'cmolmar422@capitulaciones.local')"
}
```

## Datos
`programas/cursos/<2026-27>/` → hechos (plazos), grupos, sesiones, reuniones, palancas, retos, informes y cotejo.
El alumnado se guarda solo por siglas.

Los plazos (`plazos.js`) se copian de la Agenda del Equipo Directivo; las palancas (`palancas.js`) del Plan de Actividades Palanca 2026/27.
