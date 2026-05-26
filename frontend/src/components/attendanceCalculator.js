/*
 * Attendance is now computed from the *records* themselves
 *   present / (present + absent)
 * rather than against subject.sessions (the declared session count).
 * Real data routinely has more records than declared sessions, which
 * used to make overall % blow past 100 — saw 10238% on the live
 * dashboard before the switch. Records-based math is also the natural
 * answer to "of the sessions held, what % did the student attend".
 *
 * The legacy `sessions` field is still kept on groupAttendanceBySubject
 * so existing UI columns that show a session count keep working — it
 * now reflects the actual number of records for that subject.
 */

const clampPct = (n) => Math.min(100, Math.max(0, n));

export const calculateSubjectAttendancePercentage = (presentCount, totalSessions) => {
    const total = Number(totalSessions) || 0;
    const present = Number(presentCount) || 0;
    if (total === 0) return 0;
    return clampPct((present / total) * 100).toFixed(2);
};

export const groupAttendanceBySubject = (subjectAttendance) => {
    const attendanceBySubject = {};

    subjectAttendance.forEach((attendance) => {
        const subName = attendance.subName?.subName || attendance.subName;
        const subId = attendance.subName?._id || String(attendance.subName);

        if (!attendanceBySubject[subName]) {
            attendanceBySubject[subName] = {
                present: 0,
                absent: 0,
                sessions: 0,   // count of records, populated below
                allData: [],
                subId: subId,
            };
        }
        if (attendance.status === "Present") {
            attendanceBySubject[subName].present++;
        } else if (attendance.status === "Absent") {
            attendanceBySubject[subName].absent++;
        }
        attendanceBySubject[subName].allData.push({
            date: attendance.date,
            status: attendance.status,
        });
    });

    // `sessions` = number of attendance records actually held for this
    // subject (present + absent). Matches what users see in the table
    // and keeps subject % from exceeding 100.
    Object.values(attendanceBySubject).forEach(b => {
        b.sessions = b.present + b.absent;
    });

    return attendanceBySubject;
};

export const calculateOverallAttendancePercentage = (subjectAttendance) => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) return 0;
    let present = 0;
    let total = 0;
    subjectAttendance.forEach(a => {
        if (a.status === 'Present') { present++; total++; }
        else if (a.status === 'Absent') { total++; }
    });
    if (total === 0) return 0;
    return clampPct((present / total) * 100);
};