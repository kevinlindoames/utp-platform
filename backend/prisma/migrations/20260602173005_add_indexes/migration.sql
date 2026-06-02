-- This is an empty migration.-- Índice para búsqueda por email en la tabla "User"
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_email" ON "User" ("email");

-- Índice para búsqueda por nombre de curso (si la tuvieras)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_course_name" ON "Course" ("name");