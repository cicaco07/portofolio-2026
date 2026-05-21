export function initNavScroll(navbarId = 'navbar'): void {
	const navbar = document.getElementById(navbarId);
	if (!navbar) return;

	window.addEventListener('scroll', () => {
		if (window.scrollY > 50) {
			navbar.classList.add('nav-scrolled');
		} else {
			navbar.classList.remove('nav-scrolled');
		}
	});
}

export function initNavActiveLink(linkSelector = '.nav-link'): void {
	const links = document.querySelectorAll<HTMLAnchorElement>(linkSelector);
	if (links.length === 0) return;

	const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

	links.forEach((link) => {
		const href = link.getAttribute('href');
		if (!href) return;

		const linkPath = href.replace(/\/+$/, '') || '/';

		const isActive =
			linkPath === '/'
				? currentPath === '/'
				: currentPath === linkPath || currentPath.startsWith(linkPath + '/');

		if (isActive) {
			link.classList.add('nav-active');
		} else {
			link.classList.remove('nav-active');
		}
	});
}

export function initMobileMenu(
	toggleId   = 'menu-toggle',
	menuId     = 'mobile-menu',
	linkClass  = 'mobile-nav-link',
): void {
	const toggle = document.getElementById(toggleId);
	const menu   = document.getElementById(menuId);
	if (!toggle || !menu) return;

	const spans = toggle.querySelectorAll<HTMLElement>('.hamburger-lines span');
	let open    = false;

	function close(): void {
		open = false;
		menu.classList.add('opacity-0', 'pointer-events-none');
		menu.classList.remove('opacity-100', 'pointer-events-auto');
		spans[0]?.classList.remove('rotate-45', 'translate-y-2');
		spans[1]?.classList.remove('opacity-0', 'scale-0');
		spans[2]?.classList.remove('-rotate-45', '-translate-y-2');
	}

	toggle.addEventListener('click', () => {
		open = !open;
		if (open) {
			menu.classList.remove('opacity-0', 'pointer-events-none');
			menu.classList.add('opacity-100', 'pointer-events-auto');
			spans[0]?.classList.add('rotate-45', 'translate-y-2');
			spans[1]?.classList.add('opacity-0', 'scale-0');
			spans[2]?.classList.add('-rotate-45', '-translate-y-2');
		} else {
			close();
		}
	});

	document.querySelectorAll(`.${linkClass}`).forEach((link) => {
		link.addEventListener('click', close);
	});
}
