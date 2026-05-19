
    // CONFIGURATION
    const API_BASE = window.location.origin;
    const SESSION_ID = 'session_' + Math.random().toString(36).substr(2, 9);
    let isWaiting = false;

    // SEND MESSAGE
    async function sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || isWaiting) return;

        // Remove welcome card
        const welcome = document.querySelector('.welcome-card');
        if (welcome) welcome.remove();

        // Add user message
        addMessage(message, 'user');
        input.value = '';
        input.focus();

        // Show typing indicator
        setTyping(true);
        isWaiting = true;
        document.getElementById('send-btn').disabled = true;

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, session_id: SESSION_ID })
            });

            const data = await response.json();

            setTyping(false);

            // Determine message style based on moderation
            let bubbleClass = '';
            if (data.moderation) {
                if (data.moderation.status === 'warning') bubbleClass = 'warning-msg';
                if (data.moderation.status === 'cooldown') bubbleClass = 'cooldown-msg';
                updateStrikes(data.moderation.strikes, data.moderation.status);
            }

            // Add bot response
            addMessage(data.answer || data.error || 'Maaf, terjadi kesalahan.', 'bot', {
                category: data.category,
                confidence: data.confidence,
                bubbleClass
            });

            // Update screen time
            if (data.screen_time) {
                updateScreenTime(data.screen_time);
            }

        } catch (error) {
            setTyping(false);
            addMessage('Maaf, tidak bisa terhubung ke server. Pastikan server sudah jalan ya! 😊', 'bot', {
                bubbleClass: 'warning-msg'
            });
            console.error('Error:', error);
        }

        isWaiting = false;
        document.getElementById('send-btn').disabled = false;
    }

    // ADD MESSAGE TO CHAT
    function addMessage(text, type, options = {}) {
        const container = document.getElementById('chat-messages');
        const typing = document.getElementById('typing-indicator');

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        const avatar = type === 'bot' ? '🔬' : '👤';
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        let metaHtml = `<span class="message-time">${time}</span>`;
        if (options.category) {
            metaHtml += `<span class="message-category">${options.category}</span>`;
        }
        if (options.confidence && options.confidence > 0) {
            metaHtml += `<span class="message-confidence">${(options.confidence * 100).toFixed(0)}% match</span>`;
        }

        // Convert newlines to <br>
        const formattedText = text.replace(/\n/g, '<br>');

        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble ${options.bubbleClass || ''}">${formattedText}</div>
                <div class="message-meta">${metaHtml}</div>
            </div>
        `;

        container.insertBefore(msgDiv, typing);
        container.scrollTop = container.scrollHeight;
    }

    // UI HELPERS
    function setTyping(show) {
        const el = document.getElementById('typing-indicator');
        el.classList.toggle('show', show);
        if (show) {
            const container = document.getElementById('chat-messages');
            container.scrollTop = container.scrollHeight;
        }
    }

    function updateScreenTime(data) {
        const badge = document.getElementById('badge-time');
        const mins = Math.round(data.duration_minutes);
        badge.textContent = `⏱️ ${mins}m`;

        const reminderEl = document.getElementById('screen-reminder');
        if (data.reminder) {
            reminderEl.textContent = data.reminder;
            reminderEl.className = `screen-reminder ${data.should_break ? 'strong' : 'soft'}`;
        }
    }

    function updateStrikes(count, status) {
        const badge = document.getElementById('badge-strikes');
        badge.textContent = `⚡ ${count}/3`;
        badge.className = 'badge badge-strikes';
        if (count >= 3) badge.classList.add('danger');
        else if (count >= 1) badge.classList.add('warning');
    }

    function askQuestion(question) {
        document.getElementById('chat-input').value = question;
        sendMessage();
    }

    // KEYBOARD EVENT
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Focus input on load
    document.getElementById('chat-input').focus();
