const contentFrame = document.getElementById("content-frame");

const routes = {
	dashboard: "dashboard.html",
	employe: "Employe.html",
	employes: "Employe.html",
	journal: "journal.html",
	ajouter: "ajouter.html",
};

function normalizePage(page) {
	if (Object.prototype.hasOwnProperty.call(routes, page)) {
		return page;
	}

	return "dashboard";
}

function loadPage(page, updateHash = true) {
	const normalizedPage = normalizePage(page);

	if (contentFrame) {
		contentFrame.src = routes[normalizedPage];
	}
}

window.addEventListener("message", (event) => {
	if (!event.data || event.data.type !== "navigate") {
		return;
	}

	loadPage(event.data.page);
});

window.addEventListener("DOMContentLoaded", () => {
	loadPage("dashboard", false);
});
