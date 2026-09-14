const start = document.getElementById('start');
const originalLabel = start.innerHTML;
start.disabled = true;
start.textContent = '街を準備しています…';
try {
  await import('./game.js?v=diagnostic-3');
  start.innerHTML = originalLabel;
  start.disabled = false;
} catch (error) {
  console.error('Game startup failed:', error);
  const graphicsFailure = /WebGL|context/i.test(String(error));
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = graphicsFailure
    ? 'このブラウザでは3D画面を表示できません。SafariやChromeなど別のブラウザで開いてください。'
    : 'ゲームの読み込みに失敗しました。通信状態を確認して、もう一度読み込んでください。';
  start.before(message);
  start.textContent = '再読み込み';
  start.disabled = false;
  start.onclick = () => location.reload();
}
