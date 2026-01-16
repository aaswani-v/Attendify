import '../features/students/StudentsPage.css';

const StudentsPage = () => {
    // Mock data based on image
    const students = [
        { id: 'STU001', name: 'Emma Johnson', class: 'Grade 10A', status: 'Present', time: '9:15 AM' },
        { id: 'STU002', name: 'Liam Smith', class: 'Grade 10A', status: 'Present', time: '9:18 AM' },
        { id: 'STU003', name: 'Olivia Brown', class: 'Grade 10A', status: 'Not Marked', time: '-' },
        { id: 'STU004', name: 'Noah Davis', class: 'Grade 10A', status: 'Absent', time: 'Manual entry' },
        { id: 'STU005', name: 'Ava Wilson', class: 'Grade 10A', status: 'Present', time: '9:22 AM' },
        { id: 'STU006', name: 'Ethan Martinez', class: 'Grade 10A', status: 'Not Marked', time: '-' },
        { id: 'STU007', name: 'Sophia Anderson', class: 'Grade 10A', status: 'Present', time: '9:25 AM' },
        { id: 'STU008', name: 'Mason Thomas', class: 'Grade 10A', status: 'Not Marked', time: '-' },
    ];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Present': return 'status-badge present';
            case 'Absent': return 'status-badge absent';
            default: return 'status-badge not-marked';
        }
    };

    return (
        <div className="students-page">
            <div className="sp-header">
                <h2>Student List</h2>
                <p>Manage and verify student attendance</p>
            </div>

            <div className="sp-table-container">
                <table className="sp-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Status</th>
                            <th>Last Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={index}>
                                <td className="text-secondary">{student.id}</td>
                                <td className="font-medium">{student.name}</td>
                                <td>{student.class}</td>
                                <td>
                                    <span className={getStatusClass(student.status)}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>{student.time}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon check" aria-label="Mark Present">
                                            <i className='bx bx-check-circle'></i>
                                        </button>
                                        <button className="btn-icon x-mark" aria-label="Mark Absent">
                                            <i className='bx bx-x-circle'></i>
                                        </button>
                                        <button className="btn-icon qr" aria-label="QR Code">
                                            <i className='bx bx-qr-scan'></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsPage;
