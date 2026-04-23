# Feature: Sign Up

**Status:** Approved

## Overview

Allows new users to create a Course Hub account using only their email address and password. On success, the user is registered in the system and immediately authenticated, then redirected to the onboarding flow to complete their profile. Authentication is backed by Supabase Auth; a corresponding record is created in the `users` table.

## User Stories

- As a **visitor**, I can fill in my email and password so that I can create a new account and be taken to onboarding to complete my profile.
