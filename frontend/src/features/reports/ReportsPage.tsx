import React, { useState } from 'react';
import './ReportsPage.css';

const ReportsPage = () => {
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [selectedPeriod, setSelectedPeriod] = useState('This Semester');
    const [selectedFormat, setSelectedFormat] = useState('PDF');

    // Mock data for class-wise chart
    const classData = [
        { name: 'Grade 10A', present: 42, absent: 8 },
        { name: 'Grade 10B', present: 38, absent: 7 },
        { name: 'Grade 10C', present: 45, absent: 5 },
    ];

    const maxVal = 60; // Scale for bars

    return (
        <div className="reports-page">
            {/** Header Section **/}
            <div className="rp-header-row">
                <div className="rp-title">
                    <h2>Attendance Reports</h2>
                    <p>Generate and analyze attendance reports</p>
                </div>
                <button className="btn-download">
                    <i className='bx bx-download'></i> Download Report
                </button>
            </div>

            {/** Filters Section **/}
            <div className="rp-card filters-card">
                <h3>Report Filters</h3>
                <p>Customize your report parameters</p>

                <div className="filters-row">
                    <div className="filter-group">
                        <label>Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option>All Classes</option>
                            <option>Grade 10A</option>
                            <option>Grade 10B</option>
                            <option>Grade 10C</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Period</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Semester</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Format</label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                        >
                            <option>PDF</option>
                            <option>Excel</option>
                            <option>CSV</option>
                        </select>
                    </div>
                </div>
            </div>

            {/** Charts Section **/}
            <div className="charts-row">
                {/** Class-wise Attendance Bar Chart **/}
                <div className="rp-card chart-card">
                    <div className="card-header">
                        <h3>Class-wise Attendance</h3>
                        <p>Attendance comparison across classes</p>
                    </div>

                    <div className="bar-chart-container">
                        <div className="y-axis">
                            <span>60</span>
                            <span>45</span>
                            <span>30</span>
                            <span>15</span>
                            <span>0</span>
                        </div>
                        <div className="bars-area">
                            {/* Grid Lines */}
                            <div className="grid-lines">
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                            </div>

                            {/* Bars */}
                            {classData.map((data, index) => (
                                <div className="class-group" key={index}>
                                    <div className="bars">
                                        <div
                                            className="bar present"
                                            style={{ height: `${(data.present / maxVal) * 100}%` }}
                                            title={`Present: ${data.present}`}
                                        ></div>
                                        <div
                                            className="bar absent"
                                            style={{ height: `${(data.absent / maxVal) * 100}%` }}
                                            title={`Absent: ${data.absent}`}
                                        ></div>
                                    </div>
                                    <span className="label">{data.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-legend">
                        <div className="legend-item"><span className="dot present"></span>Present</div>
                        <div className="legend-item"><span className="dot absent"></span>Absent</div>
                    </div>
                </div>

                {/** Attendance Distribution Pie Chart **/}
                <div className="rp-card chart-card">
                    <div className="card-header">
                        <h3>Attendance Distribution</h3>
                        <p>Overall attendance status</p>
                    </div>

                    <div className="pie-chart-wrapper">
                        <div className="pie-chart">
                            <div className="slice" style={{ '--p': 86, '--c': '#22c55e' } as React.CSSProperties}></div>
                        </div>
                        <div className="pie-labels">
                            <span className="pie-label present">Present: 86%</span>
                            <span className="pie-label absent">Absent: 14%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
