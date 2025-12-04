"use strict";

// netlify/functions/submit-form.js
exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }
  try {
    const formData = JSON.parse(event.body);
    const requiredFields = ["name", "email", "location", "experience", "technologies", "motivation"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields",
          missingFields
        })
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid email format" })
      };
    }
    if (formData.github) {
      const githubValidation = await validateGitHubProfile(formData.github);
      if (!githubValidation.isValid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: githubValidation.message })
        };
      }
    }
    const customerIOSiteId = process.env.CUSTOMERIO_SITE_ID;
    const customerIOApiKey = process.env.CUSTOMERIO_TRACK_API_KEY;
    console.log("\u{1F50D} Customer.io config check:", {
      siteIdExists: !!customerIOSiteId,
      apiKeyExists: !!customerIOApiKey,
      siteIdLength: customerIOSiteId?.length || 0,
      apiKeyLength: customerIOApiKey?.length || 0
    });
    let customerIOSuccess = false;
    if (customerIOSiteId && customerIOApiKey) {
      try {
        const customerData = {
          id: formData.email,
          // Usar email como ID único
          email: formData.email,
          //attributes: {
          // Información personal
          name: formData.name,
          // Ubicación - campos separados
          country_code: formData.location?.country?.code,
          country_name: formData.location?.country?.name,
          country_region: formData.location?.country?.region,
          country_subregion: formData.location?.country?.subregion,
          city: formData.location?.city,
          // Experiencia profesional
          experience: formData.experience,
          dev_language: formData.devLanguage || "",
          how_heard: formData.howHeard || "",
          technologies: formData.technologies,
          github: formData.github || "",
          motivation: formData.motivation,
          // Metadatos del formulario
          source: "b4os-website",
          form_version: "2025-v1",
          application_timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          created_at: Math.floor(Date.now() / 1e3),
          // Campos adicionales para segmentación
          has_github: !!(formData.github && formData.github.trim()),
          experience_level: getExperienceLevel(formData.experience),
          is_spanish_speaker: formData.location?.country?.code === "ES",
          is_latam: isLatamCountry(formData.location?.country?.code),
          primary_technology: extractPrimaryTechnology(formData.technologies)
          //}
        };
        const customerIOResponse = await fetch(`https://track.customer.io/api/v1/customers/${encodeURIComponent(formData.email)}`, {
          method: "PUT",
          headers: {
            "Authorization": `Basic ${Buffer.from(customerIOSiteId + ":" + customerIOApiKey).toString("base64")}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(customerData)
        });
        if (customerIOResponse.ok) {
          customerIOSuccess = true;
          console.log("\u2705 Customer.io: Usuario creado/actualizado");
          const eventResponse = await fetch(`https://track.customer.io/api/v1/customers/${encodeURIComponent(formData.email)}/events`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${Buffer.from(customerIOSiteId + ":" + customerIOApiKey).toString("base64")}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: "b4os_application_submitted",
              data: {
                // Datos del evento como campos separados
                form_experience: formData.experience,
                form_technologies: formData.technologies,
                form_country: formData.location?.country?.name,
                form_country_code: formData.location?.country?.code,
                form_city: formData.location?.city,
                form_github: formData.github || "",
                form_motivation_length: formData.motivation?.length || 0,
                form_has_github: !!(formData.github && formData.github.trim()),
                form_dev_language: formData.devLanguage || "",
                form_how_heard: formData.howHeard || "",
                // Metadatos del evento
                event_timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                event_source: "b4os-website",
                event_version: "2025-v1"
              }
            })
          });
          if (eventResponse.ok) {
            console.log("\u2705 Customer.io: Evento enviado");
          }
        } else {
          const errorText = await customerIOResponse.text();
          console.error("\u274C Customer.io API error:", {
            status: customerIOResponse.status,
            statusText: customerIOResponse.statusText,
            body: errorText,
            headers: Object.fromEntries(customerIOResponse.headers.entries())
          });
        }
      } catch (customerIOError) {
        console.error("\u274C Customer.io request failed:", customerIOError);
      }
    } else {
      console.log("\u26A0\uFE0F Customer.io no configurado - variables de entorno faltantes");
    }
    console.log("\u{1F4DD} Nueva aplicaci\xF3n B4OS:", {
      email: formData.email,
      name: formData.name,
      country: formData.location?.country?.name,
      city: formData.location?.city,
      experience: formData.experience,
      devLanguage: formData.devLanguage,
      howHeard: formData.howHeard,
      technologies: formData.technologies,
      customerIOStatus: customerIOSuccess ? "success" : "failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Aplicaci\xF3n enviada exitosamente",
        services: {
          customerIO: customerIOSuccess
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      })
    };
  } catch (error) {
    console.error("\u274C Error processing form:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: "Error processing your application. Please try again.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      })
    };
  }
};
function getExperienceLevel(experience) {
  if (!experience) return "unknown";
  if (experience.includes("2-5")) return "junior-mid";
  if (experience.includes("5-10")) return "senior";
  if (experience.includes("10+")) return "expert";
  return experience;
}
function isLatamCountry(countryCode) {
  const latamCountries = [
    "AR",
    "BO",
    "BR",
    "CL",
    "CO",
    "CR",
    "CU",
    "EC",
    "SV",
    "GT",
    "HN",
    "MX",
    "NI",
    "PA",
    "PY",
    "PE",
    "DO",
    "UY",
    "VE"
  ];
  return latamCountries.includes(countryCode);
}
function extractPrimaryTechnology(technologies) {
  if (!technologies) return "unknown";
  const tech = technologies.toLowerCase();
  if (tech.includes("javascript") || tech.includes("js") || tech.includes("node")) return "javascript";
  if (tech.includes("python")) return "python";
  if (tech.includes("rust")) return "rust";
  if (tech.includes("c++") || tech.includes("cpp")) return "cpp";
  if (tech.includes("go") || tech.includes("golang")) return "go";
  if (tech.includes("java")) return "java";
  if (tech.includes("typescript") || tech.includes("ts")) return "typescript";
  if (tech.includes("react")) return "react";
  if (tech.includes("vue")) return "vue";
  if (tech.includes("angular")) return "angular";
  const words = technologies.split(/[,\s]+/);
  return words[0]?.toLowerCase() || "other";
}
async function validateGitHubProfile(url) {
  try {
    const githubRegex = /^https:\/\/github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
    const match = url.match(githubRegex);
    if (!match) {
      return {
        isValid: false,
        message: "La URL debe tener el formato https://github.com/username"
      };
    }
    const username = match[1];
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "B4OS-Application-Form"
      }
    });
    if (response.status === 404) {
      return {
        isValid: false,
        message: 'No pudimos encontrar este usuario de GitHub. Revisa el nombre o <a href="https://github.com" target="_blank" rel="noopener noreferrer">crea una cuenta en GitHub</a>.'
      };
    }
    if (!response.ok) {
      console.warn("GitHub API error, validating format only:", response.status);
      return { isValid: true };
    }
    return { isValid: true };
  } catch (error) {
    console.warn("Error validating GitHub profile:", error);
    const basicFormat = /^https:\/\/github\.com\/[a-zA-Z0-9-]+$/;
    return {
      isValid: basicFormat.test(url),
      message: basicFormat.test(url) ? "" : "Formato de URL de GitHub inv\xE1lido"
    };
  }
}
//# sourceMappingURL=submit-form.js.map
