## CTF Workbench

> my project for hackclub it is mostly made for people that do CTF's on TryHackMe or on HackTheBox with an dashboard that is easy to understand and use

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://sraesen.github.io/ctf-workbench/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-blue?style=for-the-badge)](https://github.com/sraesen/ctf-workbench)

---

## the build:
I build it because it was always annoying to have multiple tabs open and having notes everywhere with info when i was doing my ctf's on TryHackMe. Using this makes it easier because i have all my info and notes in 1 place and it also has an export button so you can save you're work and use it as an easy startup for you're writeups.

## the dashboard:

-two buttons on the top one for an report with the info you gave it so you have a bit of a easy writeup and also a reset workbench button because it saves info on localstorage so if you accidentally refresh the page it's still all here.
-  machine timer with button's so you know when you're room is about to expire (mostly for tryhackme)
- an input area where you can paste you're target ip and attacker ip (tryhackme attackbox, own vpn or hackthebox vpn ip address)
- flags input area where you can paste the flags in
- text box where you can put in user credentials or other user info
- an checklist which you can use if you want to with the steps to have an succesfull ctf and get the flags
- an command cheat sheet so you can easy get command for different things (network exploration, web enumeration, rev shells, etc)
- an rev shell generator so you can get some basic rev shells going perfect for some of the easier rooms in tryhackme ( if it isn't working correctly because it is to basic you can always go to https://www.revshells.com/
- it also contains an very basic string and hash encoder, decoder and identifier
- text block where you can just straight up paste you're network scanner results(nmap or rustscan or whatever you use)
- a text block where you can paste notes and make you're own commands if you want to change up the cheat sheet commands a bit
- and the final function is an small made terminal looking box where you can put you're used commands in so you can kind of log you're used commands


---

## Quick Start

### Live Version
[sraesen.github.io/ctf-workbench](https://sraesen.github.io/ctf-workbench/)

### Run Locally
```bash
git clone [https://github.com/sraesen/ctf-workbench.git](https://github.com/sraesen/ctf-workbench.git)
