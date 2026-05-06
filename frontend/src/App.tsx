import { CalculatorProvider } from '@/context/CalculatorContext'

function App() {
  return (
    <CalculatorProvider>
      <main className="app-shell">
        <section className="status-card">
          <p className="eyebrow">Frontend foundation</p>
          <h1>FS Calculator</h1>
          <p>
            The API client, calculator state management, and test harness are
            ready. The calculator interface lands in the next task.
          </p>
        </section>
      </main>
    </CalculatorProvider>
  )
}

export default App
