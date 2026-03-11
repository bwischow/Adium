-- ============================================================
-- Migration 003: Add profile fields to companies
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

alter table companies add column if not exists website text;
alter table companies add column if not exists phone   text;
alter table companies add column if not exists email   text;
