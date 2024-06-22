
document.addEventListener('DOMContentLoaded', () => 
{
    const moonButton = document.getElementById('moon_theme');
    const sunButton = document.getElementById('sun_theme');
    const paletteButton = document.getElementById('palette_theme');

    const changeTheme = (theme) => 
    { ///schimba tema 
        document.body.className = '';  ///reseteaza
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    }

    /// aplica tema initiala la incarcarea paginii
    const applyInitialTheme = () => {
        const initialTheme = localStorage.getItem('theme') || 'sun';
        document.getElementById(`${initialTheme}_theme`).checked = true;
        changeTheme(initialTheme);
    }

    applyInitialTheme();

    /// event listener pentru fiecare buton 
    moonButton.addEventListener('change', () => changeTheme('moon'));
    sunButton.addEventListener('change', () => changeTheme('sun'));
    paletteButton.addEventListener('change', () => changeTheme('palette'));
});
