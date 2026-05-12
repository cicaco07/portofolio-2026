export function initTypewriter(elementId: string, roles: string[]): void {
	const el = document.getElementById(elementId);
	if (!el || !roles.length) return;

	let roleIdx    = 0;
	let charIdx    = 0;
	let deleting   = false;
	let pauseFrames = 0;

	function tick(): void {
		const current = roles[roleIdx];

		if (pauseFrames > 0) {
			pauseFrames--;
			setTimeout(tick, 80);
			return;
		}

		if (!deleting) {
			el.textContent = current.slice(0, charIdx + 1);
			charIdx++;
			if (charIdx === current.length) {
				deleting     = true;
				pauseFrames  = 20;
			}
			setTimeout(tick, 80);
		} else {
			el.textContent = current.slice(0, charIdx - 1);
			charIdx--;
			if (charIdx === 0) {
				deleting    = false;
				roleIdx     = (roleIdx + 1) % roles.length;
				pauseFrames = 5;
				setTimeout(tick, 80);
			} else {
				setTimeout(tick, 40);
			}
		}
	}

	setTimeout(tick, 800);
}
