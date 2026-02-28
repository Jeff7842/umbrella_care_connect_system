(function() {
            const toggle = document.getElementById('themeToggle');
            const body = document.body;

            // check local storage for mode
            if (localStorage.getItem('umbrellaTheme') === 'dark') {
                body.classList.add('dark-mode');
                body.classList.remove('light-mode');
            } else {
                body.classList.add('light-mode');
                body.classList.remove('dark-mode');
            }

            toggle.addEventListener('click', () => {
                if (body.classList.contains('light-mode')) {
                    body.classList.replace('light-mode', 'dark-mode');
                    localStorage.setItem('umbrellaTheme', 'dark');
                } else {
                    body.classList.replace('dark-mode', 'light-mode');
                    localStorage.setItem('umbrellaTheme', 'light');
                }
            });
        })();