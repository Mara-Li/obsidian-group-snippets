
export function getAllDetailsState() {
	const detailsState = [];
	for (let i = 0; i < document.getElementsByTagName('details').length; i++) {
		const details = document.getElementsByTagName('details')[i] as HTMLDetailsElement;
		if (details.open) {
			detailsState.push({name: details.innerText.split('\n')[0]});
		}
	}
	return detailsState;
}


export function OpenAllDetails(detailsState: {name: string}[]) {
	for (let i = 0; i < document.getElementsByTagName('details').length; i++) {
		const details = document.getElementsByTagName('details')[i] as HTMLDetailsElement;
		for (let j = 0; j < detailsState.length; j++) {
			if (details.innerText === detailsState[j].name) {
				details.open = true;
			}
		}
	}
}
