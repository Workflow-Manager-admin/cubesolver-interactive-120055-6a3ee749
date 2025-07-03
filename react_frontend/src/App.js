import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * COLORS:
 *   primary: #1976d2 (blue)  accent: #43a047 (green)  secondary: #ff9800 (orange)
 */

// --- Helper Cube Logic ---
// PUBLIC_INTERFACE
function defaultCubeState() {
  // Faces: U (Up), R (Right), F (Front), D (Down), L (Left), B (Back)
  // Each face: 3x3 color grid. Colors: W, G, R, B, O, Y.
  // Standard solved state:
  // U: White, D: Yellow, F: Green, B: Blue, L: Orange, R: Red
  return {
    U: Array(3).fill(null).map(() => Array(3).fill("W")),
    R: Array(3).fill(null).map(() => Array(3).fill("R")),
    F: Array(3).fill(null).map(() => Array(3).fill("G")),
    D: Array(3).fill(null).map(() => Array(3).fill("Y")),
    L: Array(3).fill(null).map(() => Array(3).fill("O")),
    B: Array(3).fill(null).map(() => Array(3).fill("B")),
  };
}

// PUBLIC_INTERFACE
function faceColorToHex(color) {
  switch (color) {
    case "W": return "#ffffff";
    case "Y": return "#ffe43b";
    case "G": return "#43a047"; // accent
    case "B": return "#1976d2"; // primary
    case "O": return "#ff9800"; // secondary
    case "R": return "#e53935"; // red
    default:  return "#d1d6db";
  }
}

// PUBLIC_INTERFACE
function faceColorName(color) {
  switch (color) {
    case "W": return "White";
    case "Y": return "Yellow";
    case "G": return "Green";
    case "B": return "Blue";
    case "O": return "Orange";
    case "R": return "Red";
    default: return "Unknown";
  }
}

const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];
const COLOR_CHOICES = ["W", "Y", "G", "B", "O", "R"];

// --- Components ---

// PUBLIC_INTERFACE
function Navbar() {
  return (
    <nav className="cube-navbar">
      <div className="cube-navbar-title">
        <span role="img" aria-label="cube" style={{marginRight: 8}}>
          🧊
        </span>
        3x3 Cube Solver
      </div>
      <a
        href="https://github.com/cubing"
        className="cube-navbar-link"
        target="_blank"
        rel="noopener noreferrer"
      >Learn more</a>
    </nav>
  );
}

// PUBLIC_INTERFACE
function CubeFaceEditor({ face, squares, onChange, selectedColor, setSelectedSquare }) {
  // face like "U", squares: 3x3 color array
  return (
    <div className="cube-face-editor" data-face={face}>
      <div className="cube-face-title">{face}</div>
      <div className="cube-face-grid">
        {squares.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              className="cube-face-cell"
              style={{
                background: faceColorToHex(cell),
                color: (cell === "W" || cell === "Y") ? "#111" : "#fff"
              }}
              title={`Set color: ${faceColorName(cell)}`}
              tabIndex={0}
              aria-label={`Set ${face} [${rIdx},${cIdx}] color`}
              onClick={() => setSelectedSquare && setSelectedSquare(face, rIdx, cIdx)}
            >
              {/* Show nothing, just color */}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function CubeEditor({
  cubeState,
  setCubeState,
  selectedColor,
  setSelectedColor,
  selectedSquare,
  setSelectedSquare
}) {
  // Handler to update color of a cube square
  function handleCellClick(face, r, c) {
    setSelectedSquare(face, r, c);
    // Optionally paint right away if a color is selected
    if (selectedColor) {
      const newCube = JSON.parse(JSON.stringify(cubeState));
      newCube[face][r][c] = selectedColor;
      setCubeState(newCube);
    }
  }

  function handlePaint() {
    if (!selectedSquare || !selectedColor) return;
    const [face, r, c] = selectedSquare;
    const newCube = JSON.parse(JSON.stringify(cubeState));
    newCube[face][r][c] = selectedColor;
    setCubeState(newCube);
  }

  // Render controls: color picker, 6 faces, selected
  return (
    <div className="cube-editor-panel">
      <div className="cube-editor-title">Cube Editor</div>
      <div className="cube-color-picker">
        {COLOR_CHOICES.map(clr => (
          <button
            key={clr}
            className={`cube-color-btn${selectedColor === clr ? " selected" : ""}`}
            style={{background: faceColorToHex(clr)}}
            title={faceColorName(clr)}
            aria-label={faceColorName(clr)}
            onClick={() => setSelectedColor(clr)}
          >
            {selectedColor === clr ? "✓" : ""}
          </button>
        ))}
        <span style={{marginLeft: 16, fontSize:14, color:"#aaa"}}>Pick color</span>
      </div>
      <div className="cube-edit-faces-row">
        {FACE_ORDER.map(face => (
          <CubeFaceEditor
            key={face}
            face={face}
            squares={cubeState[face]}
            onChange={null}
            selectedColor={selectedColor}
            setSelectedSquare={(f, r, c) => handleCellClick(f, r, c)}
          />
        ))}
      </div>
      <div className="cube-edit-selected-label">
        {selectedSquare
          ? `Selected: ${selectedSquare[0]}[${selectedSquare[1]},${selectedSquare[2]}]`
          : "Click a square to select."}
        {selectedSquare && (
          <>
            <button
              className="cube-paint-btn"
              onClick={handlePaint}
              style={{
                background: faceColorToHex(selectedColor),
                marginLeft: 12
              }}
              disabled={!selectedColor}
              aria-label="Paint selected square"
            >Paint</button>
          </>
        )}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function SolutionPanel({ solutionSteps, loading }) {
  return (
    <div className="cube-solution-panel">
      <div className="cube-solution-title">Solution Steps</div>
      {loading ? (
        <div className="cube-solution-loading">
          Solving...
        </div>
      ) : solutionSteps.length === 0 ? (
        <div className="cube-solution-none">No solution yet. Enter a state &amp; press Solve.</div>
      ) : (
        <ol className="cube-solution-steps">
          {solutionSteps.map((step, idx) => (
            <li key={idx} className="cube-solution-step">{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function FloatingResetButton({ onReset }) {
  return (
    <button
      className="cube-floating-reset"
      onClick={onReset}
      aria-label="Reset Cube State"
      title="Reset Cube"
    >
      <span role="img" aria-label="refresh">🔄</span>
    </button>
  );
}

// --- Example 3x3x3 Cube Solving Algorithm (Mock) ---
// PUBLIC_INTERFACE
function solveCubeMock(cubeState) {
  // Returns an array of fake solution steps for demo.
  // In real use: connect to backend or use pure-js solver.
  // The input is not validated.
  // Could check if solved and return "Already solved!"
  return [
    "R U R' U'",
    "F R U R' U' F'",
    "U R U' L' U R' U' L",
    "Solve yellow cross",
    "Orient yellow corners",
    "Finish!"
  ];
}

// --- Main App ---
/**
 * PUBLIC_INTERFACE
 * Main App for 3x3 Cube Solver UI
 * - Interactive cube state editor
 * - Solve button
 * - Solution step display
 * - Reset/FAB, minimal bright color theme, responsive layout
 */
function App() {
  const [cubeState, setCubeState] = useState(defaultCubeState());
  const [selectedColor, setSelectedColor] = useState("W");
  const [selectedSquare, setSelectedSquare] = useState(null); // [face, row, col]
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset cube
  function handleResetCube() {
    setCubeState(defaultCubeState());
    setSolutionSteps([]);
    setSelectedSquare(null);
    setSelectedColor("W");
    setLoading(false);
  }

  // Solve cube (mock for now)
  function handleSolveCube() {
    setLoading(true);
    setTimeout(() => {
      setSolutionSteps(solveCubeMock(cubeState));
      setLoading(false);
    }, 400); // Simulate time delay
  }

  // Clear Solution only
  function handleClearSolution() {
    setSolutionSteps([]);
  }

  return (
    <div className="App" data-theme="light">
      <Navbar />
      <main className="cube-main">
        <section className="cube-editor-area">
          <CubeEditor
            cubeState={cubeState}
            setCubeState={setCubeState}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSquare={selectedSquare}
            setSelectedSquare={setSelectedSquare}
          />
          <div className="cube-editor-actions">
            <button
              className="cube-solve-btn"
              disabled={loading}
              style={{ background: "#1976d2", color: "#fff" }}
              onClick={handleSolveCube}
              aria-label="Solve Cube"
            >
              {loading ? "Solving..." : "Solve"}
            </button>
            <button
              className="cube-clear-btn"
              disabled={loading && solutionSteps.length === 0}
              style={{
                marginLeft: 16,
                background: "#ff9800",
                color: "#fff",
              }}
              onClick={handleClearSolution}
              aria-label="Clear Solution Steps"
            >
              Clear Solution
            </button>
          </div>
        </section>
        <section className="cube-solution-area">
          <SolutionPanel solutionSteps={solutionSteps} loading={loading} />
        </section>
      </main>
      <FloatingResetButton onReset={handleResetCube} />
      <footer className="cube-footer">
        &copy; {new Date().getFullYear()} 3x3 Cube Solver &mdash; Minimal UI Demo
      </footer>
    </div>
  );
}

export default App;
