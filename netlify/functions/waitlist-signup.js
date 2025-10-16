// Función para registrar usuarios en la waitlist
// Guarda en Customer.io con tracking del journey completo

import CustomerIO from 'customerio-node';

// Inicializar Customer.io
const cio = new CustomerIO(
    process.env.CUSTOMERIO_SITE_ID,
    process.env.CUSTOMERIO_TRACK_API_KEY
);

export const handler = async (event) => {
    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parsear el body
        const { email } = JSON.parse(event.body);

        // Validar email
        if (!email || !isValidEmail(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Email inválido',
                    message: 'Por favor proporciona un email válido'
                })
            };
        }

        // Identificar/actualizar contacto en Customer.io
        await cio.identify(email, {
            email: email,
            // Campos de waitlist
            in_waitlist: true,
            waitlist_signup_date: new Date().toISOString(),
            notified_of_reopening: false,
            applied: false,
            came_from_waitlist: false,

            // Metadata
            waitlist_source: 'registration_page_closed',
            waitlist_campaign: '2025_october_reopening'
        });

        // Trackear evento
        await cio.track(email, {
            name: 'joined_waitlist',
            data: {
                source: 'registration_closed_page',
                signup_date: new Date().toISOString(),
                campaign: '2025_october_reopening',
                user_agent: event.headers['user-agent'],
                referer: event.headers['referer'] || event.headers['referrer']
            }
        });

        console.log(`✅ Waitlist signup: ${email}`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: '¡Perfecto! Te avisaremos cuando abramos inscripciones'
            })
        };

    } catch (error) {
        console.error('❌ Error en waitlist signup:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Error al procesar tu solicitud',
                message: 'Por favor intenta nuevamente'
            })
        };
    }
};

// Función auxiliar para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
