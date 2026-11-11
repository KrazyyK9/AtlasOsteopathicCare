/*
	Light / dark theme toggle for Atlas Osteopathic Care.

	Loaded in each page's <head> (not deferred) so the saved theme is applied
	before the page paints, which avoids a flash of the light theme.

	- First visit: follows the visitor's device setting (prefers-color-scheme).
	- After the visitor uses the toggle, their choice is remembered.
	- Adds an on/off switch to the top menu (desktop) and a floating one at the
	  top right (tablet / phone, where the top menu is hidden).
*/

(function () {

	var STORAGE_KEY = 'atlas-theme',
		root = document.documentElement,
		media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null,
		buttons = [];

	var ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
		ICON_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></g></svg>';

	function getStored() {
		try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
	}

	function setStored(value) {
		try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked: still works for this page view */ }
	}

	function preferred() {
		var stored = getStored();
		if (stored === 'dark' || stored === 'light') return stored;
		return media && media.matches ? 'dark' : 'light';
	}

	function updateButtons(theme) {
		var isDark = theme === 'dark',
			title = isDark ? 'Switch to light mode' : 'Switch to dark mode';

		for (var i = 0; i < buttons.length; i++) {
			buttons[i].setAttribute('aria-checked', isDark ? 'true' : 'false');
			buttons[i].setAttribute('title', title);
		}
	}

	function apply(theme) {
		root.setAttribute('data-theme', theme);
		root.style.colorScheme = theme;
		updateButtons(theme);
	}

	function toggle() {
		var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		setStored(next);
		apply(next);
	}

	// A switch like the ones in Apple's Settings: a track with a sliding knob.
	// The knob shows a sun in light mode and a moon in dark mode.
	function makeButton(className) {
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'theme-toggle ' + className;
		button.setAttribute('role', 'switch');
		button.setAttribute('aria-label', 'Dark mode');
		button.innerHTML =
			'<span class="theme-toggle-track" aria-hidden="true">' +
				'<span class="theme-toggle-knob">' +
					'<span class="theme-toggle-icon theme-toggle-sun">' + ICON_SUN + '</span>' +
					'<span class="theme-toggle-icon theme-toggle-moon">' + ICON_MOON + '</span>' +
				'</span>' +
			'</span>';
		button.addEventListener('click', toggle);
		buttons.push(button);
		return button;
	}

	// Apply right away, before the page renders.
	apply(preferred());

	// Follow device changes until the visitor picks a theme themselves.
	if (media) {
		var onChange = function (e) {
			if (!getStored()) apply(e.matches ? 'dark' : 'light');
		};
		if (media.addEventListener) media.addEventListener('change', onChange);
		else if (media.addListener) media.addListener(onChange);
	}

	// Add the buttons once the page (and the menu built by main.js) exists.
	document.addEventListener('DOMContentLoaded', function () {

		// Desktop: last item in the top menu.
		var navList = document.querySelector('#nav > ul');
		if (navList) {
			var item = document.createElement('li');
			item.className = 'theme-toggle-item';
			item.appendChild(makeButton('theme-toggle-nav'));
			navList.appendChild(item);
		}

		// Tablet / phone: floating button at the top right.
		document.body.appendChild(makeButton('theme-toggle-floating'));

		updateButtons(root.getAttribute('data-theme'));
	});

})();
