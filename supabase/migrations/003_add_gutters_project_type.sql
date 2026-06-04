-- Migration 003: Add 'gutters' to project_type enum
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'gutters';
