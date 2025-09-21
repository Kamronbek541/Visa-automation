# Visa Application Automation Platform

**Visa Automation UZ** is a B2B SaaS platform designed for travel agencies in Uzbekistan to drastically reduce the time and eliminate errors associated with filing visa applications.

## The Problem

In today's travel industry, visa agents face a tedious and labor-intensive workflow:
1.  Sending Word document questionnaires to clients.
2.  Receiving completed forms, often with inaccuracies.
3.  **Manually transcribing** all the data from the document into the official visa portal.

This process consumes **up to 70%** of an agent's time, is prone to costly human errors, and scales poorly during high-demand seasons.

## Our Solution

We replace this archaic process with a modern, elegant system:
1.  **User-Friendly Online Form:** The agent generates a unique access code for the client. The client fills out a simple, intuitive web form in their preferred language (RU/UZ/EN).
2.  **Centralized Dashboard:** The agent views all applications in a personal dashboard, where they can review, edit, and supplement the client's data.
3.  **One-Click Automation:** With a single button press, the agent triggers our bot. It works in the background to log into the visa portal and **fill out the entire application in minutes** using the verified data.

## Key Features

*   **Multi-Language UI** for clients (Russian, Uzbek, English).
*   **Dynamic Trip Date Generation** to ensure each application appears unique.
*   **AI-Powered Travel Plan Generation** to create convincing and unique "activities" text for visa officers.
*   **Smart Conditional Logic** that adapts the form to the client's profile (marital status, travel history, etc.).
*   **Multi-Country Architecture** ready for rapid scaling to new destinations.
*   **Admin Panel** for managing agencies and their clients.

## Tech Stack

*   **Frontend & API:** Next.js, React, TypeScript, Tailwind CSS
*   **Database:** PostgreSQL (managed via Supabase)
*   **ORM:** Prisma
*   **Automation:** Puppeteer with `puppeteer-extra-plugin-stealth`
*   **AI:** OpenAI (GPT API)

## Architecture

The project is built on a modern cloud architecture ensuring low operational costs and high scalability:
-   **Web Application (Vercel):** Serves the UI for clients and agents and handles API requests.
-   **Database (Supabase):** Provides a robust and reliable data store.
-   **Background Worker (Render.com):** A dedicated service that executes the heavy, long-running Puppeteer automation tasks without slowing down the main application.

## Roadmap

-   **✅ Phase 1: United Kingdom 🇬🇧** - MVP is fully implemented and tested.
-   **➡️ Phase 2: Schengen Area Countries 🇪🇺** - In progress (Germany, Italy, France).
-   **➡️ Phase 3: United States 🇺🇸** - Planned.
-   **➡️ Phase 4: Feature Expansion** - Direct Booking/Aviasales integration, a B2C model, and advanced analytics.

---
*This project is led by CEO **Kamronbek**.*
