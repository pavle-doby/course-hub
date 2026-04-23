# Feature: Log In

**Status:** Approved

## Overview

Allows existing users to authenticate with their email address and password. On success, a session is established via Supabase Auth and the authenticated `User` record is returned. The `lastLogin` timestamp on the user record is updated.

## User Stories

- As a **registered user**, I can enter my email and password so that I can access my account.
