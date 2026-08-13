# 🤖 CTF Workbench

> A fast, lightweight, client-side workstation designed for Hack The Box, TryHackMe, and CTF challenges. Streamline your recon, payload generation, command logging, note-taking, and automated write-up exports—100% locally in your browser.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://sraesen.github.io/ctf-workbench/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JS-blue?style=for-the-badge)](https://github.com/sraesen/ctf-workbench)

---

## ✨ Features Breakdown

### 🎯 Target & Room Tracking
- **Header Banner:** Dedicated inputs for **Target IP**, **LHOST (Your IP)**, **Room Name**, and **Challenge Link** pinned at the top.
- **Instant Variable Copy:** Quick-copy buttons for your Target IP and LHOST to speed up terminal commands.

### 🛡️ AV-Bypass Reverse Shell Generator
- **Multi-Language Shells:** One-click reverse shell templates for Bash, Python, NC, PowerShell, PHP, and Perl.
- **Base64 AV-Obfuscation:** Encodes payloads automatically to prevent local Antivirus and Windows Defender from flagging your files during generation.

### 🔌 Port Surface Tracker
- **Interactive Toggles:** Clickable status chips for common ports (`22`, `80`, `445`, `8080`, etc.) to visually track open attack vectors.
- **Custom Port Input:** Add any custom port number to the tracking list on the fly.

### 🚩 Flags & Loot Box
- **Flag Collector:** Separate fields for **User Flag** and **Root Flag** with direct copy actions.
- **Loot & Credentials Log:** Track discovered usernames, passwords, SSH keys, and tokens in a structured notepad.

### 🔑 Encoders, Decoders & Hash ID
- **Multi-Format Encoder:** Convert strings between **Base64**, **URL**, and **Hex** instantly.
- **Hash Identifier:** Automatic hash length detection to quickly narrow down unknown hash types (MD5, SHA1, SHA256, NTLM, etc.).

### 📋 Methodology Checklist & Command History
- **Pentest Methodology:** Interactive step-by-step checklist covering Recon, Enumeration, Exploitation, Privilege Escalation, and Loot Collection.
- **Terminal Command Log:** Add and organize used commands with formatted blocks for quick reference.

### 💡 Quick Cheat Sheets & Notes
- **Cheat Sheet Drawer:** Embedded quick references for Linux privilege escalation, Nmap scans, reverse shell syntax, and GTFOBins.
- **Freeform Notes:** Markdown-friendly general notes area for rough thoughts and raw scan outputs.

### 📄 One-Click Markdown Export & Session Management
- **Automated `.md` Report Export:** Download a complete, pre-formatted Write-Up (`writeup.md`) combining all your target info, open ports, flags, loot, notes, and commands.
- **Persistence & Reset:** Auto-saves every input to browser `localStorage` so you never lose progress on page refresh. Includes a **Clear Workbench** option to reset for the next target.

### 🤖 CTF Easter Eggs
- Custom `robots.txt` complete with hidden endpoints, decoy flags, troll rules, and base64 hints for anyone poking around the source code.

---

## ⚡ Quick Start

### 🌐 Live Version
No installation or build required! Access the hosted version:
👉 **[sraesen.github.io/ctf-workbench](https://sraesen.github.io/ctf-workbench/)**

### 💻 Run Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/sraesen/ctf-workbench.git](https://github.com/sraesen/ctf-workbench.git)
