Realiza un git add, commit automático y push del proyecto. Sigue estos pasos exactamente:

1. Ejecuta `git status` para ver el estado actual del repositorio.

2. Si no hay cambios para commitear (working tree clean), informa al usuario y detente.

3. Ejecuta `git add -A` para agregar todos los cambios al stage.

4. Ejecuta `git diff --staged --stat` para ver el resumen de cambios staged.

5. Genera un mensaje de commit conciso en español basado en los cambios reales. El mensaje debe:
   - Empezar con un prefijo apropiado: `feat:`, `fix:`, `refactor:`, `style:`, `chore:` o `docs:`
   - Ser una línea, máximo 72 caracteres
   - Describir QUÉ cambió, no cómo

6. Ejecuta el commit con ese mensaje:
   ```
   git commit -m "<mensaje generado>"
   ```

7. Ejecuta `git push` para subir los cambios al repositorio remoto.

8. Informa al usuario el resultado: qué se commiteó y si el push fue exitoso. El hook de despliegue se ejecutará automáticamente si el push fue exitoso.
