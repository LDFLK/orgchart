import utils from "../utils/utils";

const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/"
// const apiUrl = "";

// Fetch initial gazette dates and all ministry protobuf data
const fetchInitialGazetteData = async () => {
  try {
    const response = await fetch(`${apiUrl}/v1/entities/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: {
          major: "Document",
          minor: "extgztorg",
        },
      }),
    });

    const responseForPerson = await fetch(`${apiUrl}/v1/entities/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: {
          major: "Document",
          minor: "extgztperson",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    if (!responseForPerson.ok) {
      throw new Error(`API error: ${responseForPerson.statusText}`);
    }

    const result = await response.json();
    const resultForPerson = await responseForPerson.json();

    const datesList1 = result.body.map((item) => item.created?.split("T")[0]);
    const datesList2 = resultForPerson.body.map(
      (item) => item.created?.split("T")[0]
    );

    const mergedDateList1 = datesList1.concat(datesList2).sort();
    const dates = Array.from(new Set(mergedDateList1));

    return { dates, allMinistryData: result.body };
  } catch (error) {
    console.error("Error fetching initial gazette data from API:", error);
    return {
      dates: [],
      allMinistryData: [],
    };
  }
};

const fetchPresidentsData = async (governmentNodeId = "gov_01") => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${governmentNodeId}/relations`,
      {
        method: "POST",
        body: JSON.stringify({ name: "AS_PRESIDENT" }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (e) {
    console.log(`Error fetching presidents `, e.message);
    return [];
  }
};

const fetchActiveMinistries = async (
  selectedDate,
  allMinistryData, // now a dict { id: ministryObj }
  selectedPresident
) => {
  try {
    const beforeTime = new Date().getTime();

    const response = await fetch(
      `${apiUrl}/v1/entities/${selectedPresident.id}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relatedEntityId: "",
          startTime: "",
          endTime: "",
          id: "",
          name: "AS_MINISTER",
          activeAt: `${selectedDate.date}T00:00:00Z`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const activeMinistryRelations = await response.json();

    const afterTime = new Date().getTime();
    console.log(
      `execusion time to fetch active ministries :  ${
        afterTime - beforeTime
      } msec`
    );

    // Extract relatedEntityId and startTime from each relation
    const activeMinistryInfo = activeMinistryRelations
      .filter((relation) => relation.relatedEntityId)
      .map((relation) => ({
        id: relation.relatedEntityId,
        startTime: relation.startTime || null,
      }));

    // Map ministry info using dict lookup instead of .find()
    const activeMinistries = activeMinistryInfo.map(({ id, startTime }) => {
      const ministry = allMinistryData[id];
      let name = ministry?.name || "Unknown Ministry";

      try {
        const parsed = JSON.parse(name);
        if (parsed?.value) {
          name = utils.decodeHexString(parsed.value);
        }
      } catch (e) {
        name = utils.extractNameFromProtobuf(name) || name;
        console.log(e.message);
      }

      return {
        name,
        id,
        type: "ministry",
        startTime,
        children: [],
      };
    });

    return {
      name: "Government",
      children: activeMinistries,
      type: "root",
    };
  } catch (error) {
    console.error("Error fetching active ministries:", error);
    return {
      name: "Government",
      children: [],
      type: "root",
    };
  }
};

const fetchAllPersons = async () => {
  try {
    const response = await fetch(`${apiUrl}/v1/entities/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: {
          major: "Person",
          minor: "citizen",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error fetching person data from API:", error);
    return {
      dates: [],
      allMinistryData: [],
    };
  }
};

const fetchActiveRelationsForMinistry = async (
  selectedDate,
  ministryId,
  relationType
) => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${ministryId}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relatedEntityId: "",
          startTime: "",
          endTime: "",
          id: "",
          name: relationType,
          activeAt: `${selectedDate}T00:00:00Z`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error fetching active ministries:", error);
  }
};

const fetchAllDepartments = async () => {
  // Fetch all department protobuf data
  const response = await fetch(`${apiUrl}/v1/entities/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: {
        major: "Organisation",
        minor: "department",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response;
};

const fetchAllMinistries = async () => {
  // Fetch all ministries protobuf data
  const response = await fetch(`${apiUrl}/v1/entities/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: {
        major: "Organisation",
        minor: "minister",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response;
};

const fetchAllRelationsForMinistry = async ({ministryId,relatedEntityId="",startTime="",endTime="",id="",name="",activeAt=""}) => {
  try {
    const response = await fetch(`${apiUrl}/v1/entities/${ministryId}/relations`, {
      method: "POST",
      body: JSON.stringify({
        relatedEntityId: relatedEntityId,
        startTime: startTime,
        endTime:endTime,
        id: id,
        name: name,
        activeAt: activeAt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(
      `Error fetching relations for ministry ID ${ministryId}:`,
      error
    );
    return [];
  }
};

const createDepartmentHistoryDictionary = async (allMinistryData) => {
  const departmentHistory = {};

  for (const ministry of allMinistryData) {
    const ministryId = ministry.id;

    const allRelations = await fetchAllRelationsForMinistry(ministryId);

    for (const relation of allRelations) {
      if (relation.name === "AS_DEPARTMENT") {
        const departmentId = relation.relatedEntityId;

        if (!departmentHistory[departmentId]) {
          departmentHistory[departmentId] = [];
        }

        if (!departmentHistory[departmentId].includes(ministryId)) {
          departmentHistory[departmentId].push(ministryId);
        }
      }
    }
  }

  return departmentHistory;
};

const chatbotApiCall = async (question, session_id) => {
  try {
    console.log(`this is the question ${question}`);
    const response = await fetch(`/chat`, {
      method: "POST",
      body: JSON.stringify({ question, session_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(`Chat Error`, error);
    return [];
  }
};

const getMinistriesByDepartment = async (departmentId) => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${departmentId}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "AS_DEPARTMENT",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error fetching past ministries for department:", error);
  }
};

const getDepartmentRenamedInfo = async (departmentId) => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${departmentId}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "RENAMED_TO",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error fetching renamed department info:", error);
  }
};

const getMinistriesByPerson = async (personId) => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${personId}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "AS_APPOINTED",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error fetching renamed department info:", error);
  }
};

export default {
  fetchInitialGazetteData,
  fetchAllRelationsForMinistry,
  getMinistriesByDepartment,
  createDepartmentHistoryDictionary,
  fetchActiveMinistries,
  fetchAllPersons,
  fetchActiveRelationsForMinistry,
  fetchAllMinistries,
  fetchAllDepartments,
  fetchPresidentsData,
  chatbotApiCall,
  getDepartmentRenamedInfo,
  getMinistriesByPerson
};
