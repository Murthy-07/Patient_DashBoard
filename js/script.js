console.log("Patient Dashboard loaded");

const API_URL = "https://fedskillstest.coalitiontechnologies.workers.dev/";

const USERNAME = "coalition";
const PASSWORD = "skills-test";

let bloodPressureChart = null;


// ==========================================
// LOAD PATIENT DATA
// ==========================================

async function getPatients() {

    const dashboard = document.querySelector(".dashboard");

    try {

        // ------------------------------------------
        // GET DATA FROM API
        // ------------------------------------------

        const response = await fetch(API_URL, {
            headers: {
                Authorization:
                    "Basic " + btoa(USERNAME + ":" + PASSWORD)
            }
        });

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status}`
            );
        }

        const patients = await response.json();


        // ------------------------------------------
        // FIND JESSICA TAYLOR
        // ------------------------------------------

        const jessica = patients.find(
            patient => patient.name === "Jessica Taylor"
        );

        if (!jessica) {
            throw new Error("Jessica Taylor not found");
        }


        // ------------------------------------------
        // UPDATE PROFILE
        // ------------------------------------------

        updateProfile(jessica);


        // ------------------------------------------
        // GET DIAGNOSIS HISTORY
        // ------------------------------------------

        const history = jessica.diagnosis_history;

        if (!history || history.length === 0) {
            throw new Error("Diagnosis history not available");
        }


        // ------------------------------------------
        // LATEST DIAGNOSIS
        // ------------------------------------------

        const latestDiagnosis = history[0];


        // ------------------------------------------
        // UPDATE BLOOD PRESSURE
        // ------------------------------------------

        updateBloodPressure(latestDiagnosis);


        // ------------------------------------------
        // UPDATE VITAL SIGNS
        // ------------------------------------------

        updateVitals(latestDiagnosis);


        // ------------------------------------------
        // CREATE BLOOD PRESSURE CHART
        // ------------------------------------------

        createBloodPressureChart(history);


        // ------------------------------------------
        // REMOVE LOADING STATE
        // ------------------------------------------

        if (dashboard) {
            dashboard.setAttribute("aria-busy", "false");
        }

        console.log("Dashboard loaded successfully");

    } catch (error) {

        console.error("API Error:", error);

        if (dashboard) {
            dashboard.setAttribute("aria-busy", "false");
        }
    }
}



// ==========================================
// UPDATE JESSICA PROFILE
// ==========================================

function updateProfile(patient) {

    document.getElementById("patient-name").textContent =
        patient.name;


    // Profile image

    const image = document.getElementById("patient-image");

    image.src = patient.profile_picture;
    image.alt = patient.name;


    // Date of birth

    const date = new Date(patient.date_of_birth);

    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    document.getElementById("date-of-birth").textContent =
        formattedDate;


    // Gender

    document.getElementById("gender").textContent =
        patient.gender;


    // Phone number

    document.getElementById("phone").textContent =
        patient.phone_number;


    // Emergency contact

    document.getElementById("emergency-contact").textContent =
        patient.emergency_contact;


    // Insurance

    document.getElementById("insurance").textContent =
        patient.insurance_type;
}



// ==========================================
// UPDATE BLOOD PRESSURE
// ==========================================

function updateBloodPressure(diagnosis) {

    const systolic =
        diagnosis.blood_pressure.systolic;

    const diastolic =
        diagnosis.blood_pressure.diastolic;


    // Systolic value

    document.getElementById("systolic-value").textContent =
        systolic.value;


    // Diastolic value

    document.getElementById("diastolic-value").textContent =
        diastolic.value;


    // Systolic status

    document.getElementById("systolic-level").textContent =
        "▲ " + systolic.levels;


    // Diastolic status

    document.getElementById("diastolic-level").textContent =
        "▼ " + diastolic.levels;
}



// ==========================================
// UPDATE VITAL SIGNS
// ==========================================

function updateVitals(diagnosis) {

    // ------------------------------------------
    // RESPIRATORY RATE
    // ------------------------------------------

    document.getElementById("respiratory-rate").textContent =
        diagnosis.respiratory_rate.value + " bpm";

    document.getElementById("respiratory-status").textContent =
        diagnosis.respiratory_rate.levels;


    // ------------------------------------------
    // TEMPERATURE
    // ------------------------------------------

    document.getElementById("temperature").textContent =
        diagnosis.temperature.value + "°F";

    document.getElementById("temperature-status").textContent =
        diagnosis.temperature.levels;


    // ------------------------------------------
    // HEART RATE
    // ------------------------------------------

    document.getElementById("heart-rate").textContent =
        diagnosis.heart_rate.value + " bpm";

    document.getElementById("heart-status").textContent =
        "▼ " + diagnosis.heart_rate.levels;
}



// ==========================================
// CREATE BLOOD PRESSURE CHART
// ==========================================

function createBloodPressureChart(history) {

    const chartCanvas =
        document.getElementById("bloodPressureChart");


    if (!chartCanvas) {
        return;
    }


    // API returns newest first.
    // Take the latest six records
    // and reverse them for the chart.

    const lastSixMonths =
        history.slice(0, 6).reverse();


    // ------------------------------------------
    // MONTH LABELS
    // ------------------------------------------

    const labels = lastSixMonths.map(item => {

        return `${item.month.substring(0, 3)}, ${item.year}`;

    });


    // ------------------------------------------
    // SYSTOLIC DATA
    // ------------------------------------------

    const systolicValues =
        lastSixMonths.map(item => {

            return item.blood_pressure.systolic.value;

        });


    // ------------------------------------------
    // DIASTOLIC DATA
    // ------------------------------------------

    const diastolicValues =
        lastSixMonths.map(item => {

            return item.blood_pressure.diastolic.value;

        });


    // ------------------------------------------
    // DESTROY OLD CHART
    // ------------------------------------------

    if (bloodPressureChart) {
        bloodPressureChart.destroy();
    }


    // ------------------------------------------
    // CREATE CHART
    // ------------------------------------------

    bloodPressureChart = new Chart(
        chartCanvas,
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    // ==============================
                    // SYSTOLIC
                    // ==============================

                    {
                        label: "Systolic",

                        data: systolicValues,

                        borderColor: "#e66ac5",

                        backgroundColor: "#e66ac5",

                        borderWidth: 2,

                        tension: 0.4,

                        pointRadius: 4,

                        pointHoverRadius: 6,

                        pointBorderWidth: 0
                    },


                    // ==============================
                    // DIASTOLIC
                    // ==============================

                    {
                        label: "Diastolic",

                        data: diastolicValues,

                        borderColor: "#8069d9",

                        backgroundColor: "#8069d9",

                        borderWidth: 2,

                        tension: 0.4,

                        pointRadius: 4,

                        pointHoverRadius: 6,

                        pointBorderWidth: 0
                    }

                ]
            },


            // ======================================
            // CHART OPTIONS
            // ======================================

            options: {

                responsive: true,

                maintainAspectRatio: false,


                interaction: {
                    mode: "index",
                    intersect: false
                },


                plugins: {

                    // Hide Chart.js legend
                    // because XD has its own values panel

                    legend: {
                        display: false
                    },


                    tooltip: {

                        enabled: true,

                        backgroundColor: "#072635",

                        titleFont: {
                            size: 11
                        },

                        bodyFont: {
                            size: 11
                        },

                        padding: 10,

                        displayColors: true
                    }

                },


                scales: {

                    // ==================================
                    // Y AXIS
                    // ==================================

                    y: {

                        min: 60,

                        max: 180,

                        ticks: {

                            stepSize: 20,

                            color: "#666",

                            font: {
                                size: 10
                            }

                        },

                        grid: {

                            color: "#d8d3e5",

                            drawTicks: false
                        },

                        border: {
                            display: false
                        }

                    },


                    // ==================================
                    // X AXIS
                    // ==================================

                    x: {

                        ticks: {

                            color: "#666",

                            font: {
                                size: 10
                            },

                            maxRotation: 0,

                            minRotation: 0

                        },

                        grid: {

                            color: "#d8d3e5",

                            drawTicks: false
                        },

                        border: {
                            display: false
                        }

                    }

                }

            }

        }
    );
}



// ==========================================
// START APPLICATION
// ==========================================

getPatients();