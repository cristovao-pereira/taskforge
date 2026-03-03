-- Migration: Update plan values to Portuguese
-- Changes:
-- 'free' -> 'gratis'
-- 'builder' -> 'construtor'  
-- 'strategic' -> 'estrategico'
-- Also updates default value

-- Update existing plan values
UPDATE "User" SET plan = 'gratis' WHERE plan = 'free';
UPDATE "User" SET plan = 'construtor' WHERE plan = 'builder';
UPDATE "User" SET plan = 'estrategico' WHERE plan = 'strategic' OR plan = 'Strategic' OR plan = 'STRATEGIC';

-- Update default value (Prisma handles this in schema, but documenting intent)
ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'gratis';
