import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="gameCanvas"></canvas>
    <div id="score"></div>
    <div id="gameOver" style="display:none;">Game Over! Click to Restart.</div>

    <script src="game.ts"></script>
  </div>
`

