// Test code
// const registerCallback = (cb) => setTimeout(cb.bind(null, getDummyClient(), true), 1000);
// const getDummyClient = () => ({
// 	specialWindow: false,
// 	fullScreen: true,
// 	frameGeometry: { x: 0, y: 0, width: 3456, height: 2234 },
// 	geometryChanged: { connect: (cb) => setTimeout(cb.bind(null, this), 1000) },	
// });
// const workspace = {
// 	clientArea: () => ({ x: 0, y: 0, width: 3456, height: 2234 }),
// 	clientFullScreenSet: { connect: registerCallback },
// 	clientMaximizeSet: { connect: registerCallback },
// 	clientAdded: { connect: registerCallback },
// 	clientActivated: { connect: registerCallback },
// 	screenResized: { connect: registerCallback },
// 	activeClient: getDummyClient(),
// };
// const registerShortcut = (name, desc, shortcut, cb) => { };
// const KWin = {
// 	FullScreenArea: 0,
// };
// const readConfig = (key, defaultValue) => defaultValue;
// const callDBus = (service, path, iface, method, args) => { };

const getConfigWidth = () => readConfig("screenWidth", 3456);
const getConfigHeight = () => readConfig("screenHeight", 2234);
const getConfigNotchThickness = () => readConfig("notchThickness", 65);

const errorMargin = 1e-2;
let autohidden = true;

const isAreaRightScreen = (area) => {
	const screenRatio = getConfigWidth() / getConfigHeight();

	return Math.abs(area.width / area.height - screenRatio) < errorMargin;
}

const isRightScreen = (client) => {
	const area = workspace.clientArea(KWin.FullScreenArea, client);
	return isAreaRightScreen(area);
};

const getScale = (client) => {
	const area = workspace.clientArea(KWin.FullScreenArea, client);
	return area.width / getConfigWidth();
};

const getRealNotchThickness = (client) => {
	const notchThickness = getConfigNotchThickness();
	return Math.round(notchThickness * getScale(client));
}

const changeYPosIfNecessary = (client) => (() => {
	if (client.specialWindow || !isRightScreen(client)) return;

	const area = workspace.clientArea(KWin.FullScreenArea, client);
	if (client.frameGeometry.y !== area.y) return;

	const realNotchThickness = getRealNotchThickness(client);

	const newHeight = Math.min(client.frameGeometry.height, area.height - realNotchThickness);
	client.frameGeometry = { x: client.frameGeometry.x, y: area.y + realNotchThickness, width: client.frameGeometry.width, height: newHeight }
});

const callPlasmaScript = (plasmascript) => {
	callDBus("org.kde.plasmashell", "/PlasmaShell", "org.kde.PlasmaShell", "evaluateScript", plasmascript);
};

const getBasePlasmaScript = () => `
const errorMargin = ${errorMargin};
const originalScreenWidth = ${getConfigWidth()};
const originalScreenHeight = ${getConfigHeight()};
const notchThickness = ${getConfigNotchThickness()};

const screenRatio = originalScreenWidth / originalScreenHeight;
const isRightScreen = (screenId) => {
	const screen = screenGeometry(screenId);
	return Math.abs(screen.width / screen.height - screenRatio) < errorMargin;
}
const isTaskBar = (panel) => isRightScreen(panel.screen) && panel.location === "top" && panel.formFactor === "horizontal";
const panel = panels().find(isTaskBar);
`;

const updateTaskbarThickness = (thickness) => {
	const thicknessExpression = thickness ? thickness.toString() : "notchThickness * scale";
	const plasmaScript = `
${getBasePlasmaScript()}
const scale = screenGeometry(panel.screen).width / originalScreenWidth;
panel.height = ${thicknessExpression};
`;
	callPlasmaScript(plasmaScript);
};

const autoHideTaskBar = (autohide) => {
	if (autohidden === autohide) return;

	const hiding = autohide ? "autohide" : "none";
	const plasmaScript = `
${getBasePlasmaScript()}
panel.hiding = "${hiding}";
`;
	callPlasmaScript(plasmaScript);
	autohidden = autohide;
};

const connectClient = (client) => {
	const callback = changeYPosIfNecessary(client);
	client.geometryChanged.connect(callback);
	client.fullScreenChanged.connect(() => {
		// needed because clientFullScreenSet is sometimes not emitted (e.g. firefox)
		if (client.active) autoHideTaskBar(client.fullScreen);
	});
	callback();
};

workspace.clientFullScreenSet.connect((client, fullscreen) => {
	if (!isRightScreen(client) || client.specialWindow) return;

	if (fullscreen) {
		const area = workspace.clientArea(KWin.FullScreenArea, client);

		const realNotchThickness = getRealNotchThickness(client);

		client.frameGeometry = { x: area.x, y: area.y + realNotchThickness, width: area.width, height: area.height - realNotchThickness }
	}

	if (client.active) autoHideTaskBar(fullscreen);
});

workspace.clientMaximizeSet.connect((client, maxH, maxW) => {
	if (!maxH || client.specialWindow || !isRightScreen(client)) return;

	const area = workspace.clientArea(KWin.FullScreenArea, client);
	const realNotchThickness = getRealNotchThickness(client);

	client.frameGeometry = { x: client.frameGeometry.x, y: area.y + realNotchThickness, width: client.frameGeometry.width, height: area.height - realNotchThickness };
});

workspace.clientAdded.connect(connectClient);
workspace.clientList().forEach(connectClient);

workspace.clientActivated.connect((client) => {
	const autoHidePanel = isRightScreen(client) && client.fullScreen;
	autoHideTaskBar(autoHidePanel);
});

workspace.screenResized.connect((screenId) => {
	const area = workspace.clientArea(KWin.FullScreenArea, screenId, 0);
	if (!isAreaRightScreen(area)) return;

	const scale = area.width / getConfigWidth();
	const notchThickness = getConfigNotchThickness();
	const realNotchThickness = Math.round(notchThickness * scale);
	updateTaskbarThickness(realNotchThickness);
});

updateTaskbarThickness();
autoHideTaskBar(false);