import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Schemes from '@/pages/Schemes'
import SchemeDetail from '@/pages/SchemeDetail'
import Categories from '@/pages/Categories'
import DoctorOrders from '@/pages/DoctorOrders'
import Distribution from '@/pages/Distribution'
import QA from '@/pages/QA'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/schemes" replace />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/schemes/:id" element={<SchemeDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/doctor-orders" element={<DoctorOrders />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/qa" element={<QA />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}
