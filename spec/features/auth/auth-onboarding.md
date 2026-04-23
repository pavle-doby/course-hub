# Feature: Onboarding

**Status:** Draft

## Overview

After a user completes the sign-up form they are redirected to an onboarding flow before accessing the platform. The onboarding currently consists of a single step where the user sets up their profile. Once completed, the user is taken to their default destination — the platform home, or the enrolled course if they arrived via an enroll-invite link.

## Onboarding Steps

| Step             | Description                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------- |
| 1. Profile Setup | User fills in their profile details and is directed to the platform (or enrolled course). |

## Profile Setup Form

| Field        | Required | Notes                                      |
| ------------ | -------- | ------------------------------------------ |
| `profileUrl` | No       | User can upload an optional profile image. |
| `username`   | Yes      | Must be unique across the platform.        |
| `firstName`  | Yes      |                                            |
| `lastName`   | Yes      |                                            |
| `bio`        | No       | Short free-text description of the user.   |

## User Stories

- As a **new user**, after completing sign-up I am redirected to onboarding so that I can set up my profile before using the platform.
- As a **new user**, I can upload a profile picture during onboarding so that other users can recognize me (optional).
- As a **new user**, I must choose a unique username during onboarding so that I have a distinct identity on the platform.
- As a **new user**, I must provide my first and last name during onboarding so that my profile is complete.
- As a **new user**, I can add a short bio during onboarding so that others can learn a bit about me (optional).
- As a **new user**, after completing onboarding I am redirected to the platform home so that I can start exploring courses.
- As a **new user** who arrived via an enroll-invite link, after completing onboarding I am redirected to the enrolled course so that I can start it immediately.
