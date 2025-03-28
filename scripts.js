function getAppointments() {
    return JSON.parse(localStorage.getItem("appointments") || "[]");
}

function saveAppointments(appointments) {
    localStorage.setItem("appointments", JSON.stringify(appointments));
}

function createAppointment() {
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!title || !date || !startTime || !endTime) {
        alert("กรุณากรอกข้อมูลให้ครบ!");
        return;
    }

    let appointments = getAppointments();
    let isConflict = checkTimeConflict(date, startTime, endTime);

    const newAppointment = {
        id: Date.now().toString(),
        title,
        date,
        startTime,
        endTime,
        status: "confirmed",
        conflict: isConflict
    };

    appointments.push(newAppointment);
    saveAppointments(appointments);
    renderAppointments();
    renderUpcomingAppointments();
}

function checkTimeConflict(date, startTime, endTime) {
    const appointments = getAppointments();
    return appointments.some(appt =>
        appt.date === date &&
        appt.status !== "cancelled" &&
        ((startTime >= appt.startTime && startTime < appt.endTime) ||
         (endTime > appt.startTime && endTime <= appt.endTime))
    );
}

function cancelAppointment(id) {
    let appointments = getAppointments();
    appointments = appointments.map(appt => appt.id === id ? { ...appt, status: "cancelled" } : appt);
    saveAppointments(appointments);
    renderAppointments();
    renderUpcomingAppointments();
}

function isPastAppointment(appt) {
    const now = new Date();
    const apptDateTime = new Date(`${appt.date}T${appt.endTime}`);
    return apptDateTime < now;
}

function getUpcomingAppointments() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split("T")[0];

    return getAppointments().filter(appt => 
        appt.date === tomorrow && 
        appt.status === "confirmed" && 
        !isPastAppointment(appt)
    );
}

function renderAppointments() {
    const list = document.getElementById("appointmentsList");
    list.innerHTML = "";
    const appointments = getAppointments().filter(appt => !isPastAppointment(appt));

    if (appointments.length === 0) {
        list.innerHTML = `<li class="p-2 text-gray-500 text-center">ไม่มีการนัดหมาย</li>`;
        return;
    }

        appointments.forEach(appt => {
            const li = document.createElement("li");
            li.className = `p-2 border-b flex justify-between ${appt.status === "cancelled" ? "line-through text-gray-400" : ""}`;
            li.innerHTML = `
                <span class="${appt.conflict ? 'text-red-500 font-bold' : ''}">
                    ${appt.conflict ? '!!!' : ''} ${appt.title} (${appt.date} ${appt.startTime} - ${appt.endTime} ${appt.conflict ? '!!!' : ''}
                </span>
                <button onclick="cancelAppointment('${appt.id}')" class="text-red-500 ml-2">ยกเลิก</button>
            `;
            list.appendChild(li);
        });
}

function renderUpcomingAppointments() {
    const list = document.getElementById("upcomingAppointments");
    const upcoming = getUpcomingAppointments();

    list.innerHTML = upcoming.length > 0 
        ? upcoming.map(appt => `<li class="p-2 border-b">${appt.title} (${appt.startTime} - ${appt.endTime})</li>`).join("")
        : "<li class='p-2 text-gray-500 text-center'>ไม่มีการนัดหมายของวันพรุ่งนี้</li>";
}

renderAppointments();
renderUpcomingAppointments();

function saveToLocalStorage(key,data) {
    try {
        localStorage.setItem(key,JSON.stringify(data));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
    }
}