-- CreateTable
CREATE TABLE "staff_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'medico',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT NOT NULL,
    "especialidad" TEXT,
    "cedula" TEXT,
    "cedulaEspecialidad" TEXT,
    "universidad" TEXT,
    "logoUniversidadUrl" TEXT,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastAccess" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "expedienteNumber" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "curp" TEXT,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "grupoSanguineo" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "ocupacion" TEXT,
    "estadoCivil" TEXT,
    "escolaridad" TEXT,
    "religion" TEXT,
    "lugarNacimiento" TEXT,
    "antecedentesHeredoFamiliares" TEXT,
    "antecedentesPersonalesPatologicos" TEXT,
    "antecedentesPersonalesNoPatologicos" TEXT,
    "antecedentesGinecoObstetricos" TEXT,
    "alergias" TEXT[],
    "contactoEmergencia" TEXT,
    "telefonoEmergencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMins" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "medicoId" TEXT,
    "serviceId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "notes" TEXT,
    "bookingSource" TEXT NOT NULL DEFAULT 'staff',
    "patientName" TEXT,
    "patientEmail" TEXT,
    "patientPhone" TEXT,
    "appointmentType" TEXT,
    "actionToken" TEXT,
    "patientConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cie10_catalog" (
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT,

    CONSTRAINT "cie10_catalog_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presionSistolica" INTEGER,
    "presionDiastolica" INTEGER,
    "frecuenciaCardiaca" INTEGER,
    "frecuenciaRespiratoria" INTEGER,
    "temperatura" DOUBLE PRECISION,
    "saturacionOxigeno" INTEGER,
    "peso" DOUBLE PRECISION,
    "talla" DOUBLE PRECISION,
    "glucosa" INTEGER,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_notes" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "subtipo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivoConsulta" TEXT,
    "padecimientoActual" TEXT,
    "habitusExterior" TEXT,
    "exploracionFisica" TEXT,
    "signosVitalesTexto" TEXT,
    "subjetivo" TEXT,
    "objetivo" TEXT,
    "analisis" TEXT,
    "plan" TEXT,
    "pronostico" TEXT,
    "indicacionTerapeutica" TEXT,
    "planEstudios" TEXT,
    "diagnosticoPreoperatorio" TEXT,
    "operacionPlaneada" TEXT,
    "operacionRealizada" TEXT,
    "diagnosticoPostoperatorio" TEXT,
    "descripcionTecnicaQuirurgica" TEXT,
    "hallazgosTransoperatorios" TEXT,
    "complicaciones" TEXT,
    "sangradoAproximado" TEXT,
    "firmada" BOOLEAN NOT NULL DEFAULT false,
    "firmaHash" TEXT,
    "fechaFirma" TIMESTAMP(3),
    "firmaUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_note_addendums" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "authorId" TEXT,
    "firmaHash" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_note_addendums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_note_diagnoses" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "cie10Codigo" TEXT NOT NULL,
    "tipoDiagnostico" TEXT NOT NULL DEFAULT 'presuntivo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_note_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "recetaId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "presentacion" TEXT,
    "dosis" TEXT NOT NULL,
    "via" TEXT,
    "frecuencia" TEXT NOT NULL,
    "duracion" TEXT,
    "indicaciones" TEXT,
    "instruccionesGenerales" TEXT,
    "status" TEXT NOT NULL DEFAULT 'activa',
    "firmada" BOOLEAN NOT NULL DEFAULT false,
    "firmaHash" TEXT,
    "fechaFirma" TIMESTAMP(3),
    "firmaUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_consents" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicoId" TEXT,
    "tipoConsentimiento" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "procedimiento" TEXT,
    "riesgos" TEXT,
    "beneficios" TEXT,
    "alternativas" TEXT,
    "consentTexto" TEXT,
    "autorizaContingencias" BOOLEAN NOT NULL DEFAULT true,
    "nombreFirmante" TEXT,
    "parentescoRepresentante" TEXT,
    "nombreTestigo1" TEXT,
    "nombreTestigo2" TEXT,
    "aceptado" BOOLEAN NOT NULL DEFAULT false,
    "fechaAceptacion" TIMESTAMP(3),
    "lugarFirma" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "estudios" TEXT[],
    "diagnosticoPresuntivo" TEXT,
    "indicacionesClinicas" TEXT,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "ayuno" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "resultados" TEXT,
    "fechaResultados" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalles" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "clinicName" TEXT NOT NULL DEFAULT 'Clínica ORL Viveros',
    "clinicAddress" TEXT,
    "clinicPhone" TEXT,
    "clinicCofepris" TEXT,
    "doctorName" TEXT NOT NULL DEFAULT 'Dr. Alejandro Viveros Domínguez',
    "doctorLicense" TEXT,
    "doctorSpecialtyLicense" TEXT,
    "doctorUniversity" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "portalTitle" TEXT,
    "portalTagline" TEXT,
    "appointmentDurationMin" INTEGER NOT NULL DEFAULT 30,
    "bookingAdvanceDays" INTEGER NOT NULL DEFAULT 30,
    "bookingBufferMin" INTEGER NOT NULL DEFAULT 0,
    "horarios" JSONB,
    "diasFeriados" JSONB,
    "notificationEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arco_requests" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "arco_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fhir_exports" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "patientId" TEXT,
    "dateRangeFrom" TIMESTAMP(3),
    "dateRangeTo" TIMESTAMP(3),
    "requestedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'en_proceso',
    "fileSize" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "fhir_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_users_email_key" ON "staff_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "patients_expedienteNumber_key" ON "patients"("expedienteNumber");

-- CreateIndex
CREATE INDEX "patients_apellidoPaterno_idx" ON "patients"("apellidoPaterno");

-- CreateIndex
CREATE INDEX "patients_nombre_idx" ON "patients"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_actionToken_key" ON "appointments"("actionToken");

-- CreateIndex
CREATE INDEX "appointments_scheduledAt_idx" ON "appointments"("scheduledAt");

-- CreateIndex
CREATE INDEX "vitals_patientId_idx" ON "vitals"("patientId");

-- CreateIndex
CREATE INDEX "medical_notes_patientId_idx" ON "medical_notes"("patientId");

-- CreateIndex
CREATE INDEX "medical_notes_fecha_idx" ON "medical_notes"("fecha");

-- CreateIndex
CREATE INDEX "prescriptions_recetaId_idx" ON "prescriptions"("recetaId");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_idx" ON "prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "lab_orders_patientId_idx" ON "lab_orders"("patientId");

-- CreateIndex
CREATE INDEX "audit_logs_fecha_idx" ON "audit_logs"("fecha");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "staff_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_notes" ADD CONSTRAINT "medical_notes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_notes" ADD CONSTRAINT "medical_notes_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "staff_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_note_addendums" ADD CONSTRAINT "medical_note_addendums_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "medical_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_note_diagnoses" ADD CONSTRAINT "medical_note_diagnoses_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "medical_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_note_diagnoses" ADD CONSTRAINT "medical_note_diagnoses_cie10Codigo_fkey" FOREIGN KEY ("cie10Codigo") REFERENCES "cie10_catalog"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "staff_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "staff_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fhir_exports" ADD CONSTRAINT "fhir_exports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fhir_exports" ADD CONSTRAINT "fhir_exports_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "staff_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
