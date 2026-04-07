import React, { useEffect, useState } from 'react'
import axios from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import './Statistics.css'

const PIE_COLORS = ['#4a9eff', '#3dba7e', '#e8a44a', '#e05a5a']

function Statistics() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/applications/stats')
                setStats(response.data)
            } catch (error) {
                console.error("Errore nel caricamento delle statistiche", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="loading">Caricamento statistiche...</div>
    if (!stats) return <div className="loading">Nessun dato trovato.</div>

    const pieData = [
        { name: 'Inviate', value: stats.sent },
        { name: 'Colloquio', value: stats.interview },
        { name: 'In attesa', value: stats.waiting },
        { name: 'Rifiutate', value: stats.rejected },
    ].filter(item => item.value > 0)

    return (
        <div className="stats-page">
            <h1 className="stats-title">Statistiche</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Totale</h3>
                    <span className="number">{stats.total}</span>
                </div>
                <div className="stat-card blue">
                    <h3>Inviate</h3>
                    <span className="number">{stats.sent}</span>
                </div>
                <div className="stat-card green">
                    <h3>Colloqui</h3>
                    <span className="number">{stats.interview}</span>
                </div>
                <div className="stat-card orange">
                    <h3>In attesa</h3>
                    <span className="number">{stats.waiting}</span>
                </div>
                <div className="stat-card red">
                    <h3>Rifiutate</h3>
                    <span className="number">{stats.rejected}</span>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title">Candidature per mese</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.by_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a3044" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a90a0', fontSize: 12 }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8a90a0', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3044', borderRadius: '6px', color: '#c8cdd8' }}
                                cursor={{ fill: 'rgba(74, 158, 255, 0.05)' }}
                            />
                            <Bar dataKey="count" fill="#4a9eff" radius={[4, 4, 0, 0]} barSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Distribuzione stati</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={50}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3044', borderRadius: '6px' }}
                                itemStyle={{ 
                                    color: '#c8cdd8',
                                    fontSize: '17px' 
                                }}
                            />
                            <Legend
                                formatter={(value) => <span style={{ color: '#8a90a0', fontSize: 12 }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Grafico tag più usati */}
                {stats.top_tags && stats.top_tags.length > 0 && (
                    <div className="chart-card" style={{marginTop: '16px'}}>
                        <h3 className="chart-title">Tag più utilizzati</h3>
                        <div className="top-tags-list">
                            {stats.top_tags.map((tag, index) => {
                                const maxCount = stats.top_tags[0].count
                                const percentage = (tag.count / maxCount) * 100
                                return (
                                    <div key={index} className="top-tag-row">
                                        <span
                                            className="top-tag-name"
                                            style={{ color: tag.color }}
                                        >
                                            {tag.name}
                                        </span>
                                        <div className="top-tag-bar-track">
                                            <div
                                                className="top-tag-bar-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: tag.color
                                                }}
                                            />
                                        </div>
                                        <span className="top-tag-count">{tag.count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Grafico tipo di contratto */}
                {stats.contract_types && stats.contract_types.length > 0 && (
                    <div className="chart-card" style={{marginTop: '16px'}}>
                        <h3 className="chart-title">Distribuzione per tipo di contratto</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart
                                data={stats.contract_types}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a3044" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8a90a0', fontSize: 11 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8a90a0', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1f2e',
                                        border: '1px solid #2a3044',
                                        borderRadius: '6px',
                                        color: '#c8cdd8'
                                    }}
                                    cursor={{ fill: 'rgba(74, 158, 255, 0.05)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                    {stats.contract_types.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={['#4a9eff', '#3dba7e', '#e8a44a', '#e05a5a', '#9b7de8'][index % 5]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Statistics