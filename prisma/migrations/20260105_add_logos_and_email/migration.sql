-- Agrega email del consultorio + logos del consultorio y de la universidad
-- para impresión en recetas y notas (NOM-004-SSA3-2012).

ALTER TABLE "clinic_config"
  ADD COLUMN IF NOT EXISTS "clinicEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "clinicLogoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "doctorUniversityLogoUrl" TEXT;
