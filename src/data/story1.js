// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
// Capítulo 1 «Me llamo Sofía» (8 y 9 años): la familia, Dani y la Tata.
// Tono: telenovela mexicana y K-drama exagerados, con un respiro de humor de vez en cuando.
// Clasificación: 12+ (ver README).
//
// Cada escena tiene un lugar ('casa', 'tienda' o un ambiente de fondo), personajes en escena y líneas:
//   { s: 'ramiro', m: 'angry', t: 'Texto', fx: 'shake' }  habla un personaje (m = gesto, fx = efecto)
//   { t: 'Texto' }                                         narrador
//   { music: 'drama' }                                     cambia la música
//   { enter: 'dani', x: 640, face: 'left' }                entra alguien caminando
//   { exit: 'kevin' }                                      sale de escena
// Gestos: idle, talk, sad, angry, cry, shock, happy, cheer. Efectos: shake, zoom, flash.
// Personajes en escena: [id, x, 'left' | 'right', gesto inicial].
// Nivel: age, weather (clima), music (de la carrera), phrases (en lugar de «¡Corre!»), correRate.

export const STORY1 = {
  'c1-1': {
    age: 8, weather: 'sol', music: 'carrera',
    phrases: ['¡No mires atrás!', 'Siente la brisa', '¡Más lejos!', 'Respira... ¡y corre!'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 250], ['ramiro', 600, 'left'], ['leticia', 760, 'left', 'angry']],
      lines: [
        { t: 'Sábado en la tarde. En casa de Sofía, otra vez, nadie escucha a nadie.' },
        { s: 'leticia', m: 'angry', t: '¡Ramiro! ¡Prometiste pintar la cocina! ¡Llevas tres sábados prometiéndolo!' },
        { s: 'ramiro', m: 'talk', t: 'Y la voy a pintar, Leti. Nada más acaba el partido... y el otro partido.' },
        { s: 'leticia', m: 'angry', t: '¡Tú no acabas nada! ¡Ni la cocina, ni el techo, solo con la paciencia de uno!', fx: 'shake' },
        { s: 'sofia', m: 'talk', t: 'Yo puedo ayudar a pintar. Sé quedarme quieta y no salirme de la raya...' },
        { s: 'leticia', m: 'angry', t: '¡Ahorita no, Sofía! Esto es plática de adultos.' },
        { s: 'ramiro', m: 'talk', t: 'Hazle caso a tu madre, princesa. Ve a jugar a otro lado.' },
        { s: 'sofia', m: 'sad', t: '...Nunca me preguntan nada.' },
        { s: 'leticia', m: 'angry', t: '¡¿Y sigues ahí parada?! ¡Te dije que ahorita no!', fx: 'zoom' },
        { music: 'ruptura' },
        { t: 'Sofía abrió la puerta y corrió. No sabía a dónde. Solo sabía que no quería estar ahí.' },
      ],
    },
    after: {
      place: 'barrio', music: 'despertar', scroll: 900,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { t: 'Tres calles después, Sofía se detuvo a respirar.' },
        { s: 'sofia', m: 'cry', t: '*snif*... ¿Por qué nadie me escucha?' },
        { t: 'Entonces sopló una brisa. Le movió el fleco, le secó la cara y le llenó el pecho.' },
        { s: 'sofia', m: 'shock', t: '...¿Qué fue eso?' },
        { s: 'sofia', m: 'cheer', t: 'Cuando corro nadie me grita. ¡Nada más está el aire!', fx: 'flash' },
        { t: 'Ese sábado, Sofía descubrió su lugar favorito del mundo: ir en movimiento.' },
      ],
    },
  },

  'c1-2': {
    age: 8, weather: 'jacaranda', music: 'carrera',
    phrases: ['¡Una vuelta más!', '¡Hasta la esquina!', 'Que te abrace el aire', '¡Vuela!'],
    before: {
      place: 'barrio', music: 'alegre', scroll: 300,
      cast: [['sofia', 300, 'right', 'happy'], ['dani', 660, 'left']],
      lines: [
        { t: 'Desde ese sábado, Sofía corre todas las tardes: de su esquina a la tienda de abarrotes y de regreso.' },
        { s: 'sofia', m: 'cheer', t: '¡Diecinueve! ...¿O eran veinte? Bueno, ¡otra más!' },
        { s: 'dani', m: 'talk', t: 'Llevas una hora yendo y viniendo. ¿Te viene persiguiendo alguien?' },
        { s: 'sofia', m: 'shock', t: '¡Dani! ¿Desde cuándo me estás viendo?' },
        { s: 'dani', m: 'talk', t: 'Desde la vuelta cinco. Estoy acomodando refrescos en la tienda de mi abuela y tú pasas enfrente.' },
        { s: 'sofia', m: 'happy', t: 'Corro porque se siente bonito. Como si el aire me abrazara.' },
        { s: 'dani', m: 'shock', t: '¿El aire te abraza? A mí nada más se me acaba.' },
        { s: 'sofia', m: 'cheer', t: '¡Ven a probar!' },
        { s: 'dani', m: 'idle', t: 'Mejor te veo desde aquí. Alguien tiene que contar las vueltas.' },
      ],
    },
    after: {
      place: 'barrio', music: 'alegre', scroll: 1200,
      cast: [['sofia', 440, 'right', 'happy'], ['dani', 600, 'left']],
      lines: [
        { s: 'dani', m: 'talk', t: 'Oye... ¿y cómo le haces para no cansarte?' },
        { s: 'sofia', m: 'happy', t: 'Sí me canso. Pero se me olvida.' },
        { s: 'dani', m: 'idle', t: 'Mmm. Interesante. Muy interesante.' },
        { t: 'Dani apuntó algo en una libretita. Sofía no supo qué era. Dani tampoco, la verdad.' },
      ],
    },
  },

  'c1-3': {
    age: 8, weather: 'nublado', music: 'carrera',
    phrases: ['Plap, plap... ¡sigue!', '¡Aguanta, tenis!', '¡Más rápido!', 'No te detengas'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 250, 'right', 'sad'], ['tomasito', 380, 'right', 'cheer'], ['leticia', 680, 'left']],
      lines: [
        { t: 'Tanto correr tuvo un precio: a la suela del tenis derecho de Sofía se le despegó la punta.' },
        { s: 'sofia', m: 'sad', t: 'Mamá, mira. Se abrió. Hace «plap, plap» cuando corro.' },
        { s: 'leticia', m: 'talk', t: 'Pues no corras tanto. Pégale cinta y ya.' },
        { s: 'sofia', m: 'sad', t: 'Ya le puse cinta. Tres veces.' },
        { s: 'tomasito', m: 'cheer', t: '¡Mamá! ¡Mamá! ¡Los tenis de dinosaurio! ¡Los que tienen lucecitas!' },
        { s: 'leticia', m: 'happy', t: 'Ay, mi rey. Claro que sí. El sábado vamos por ellos.' },
        { s: 'sofia', m: 'shock', t: '¿Y los míos?', fx: 'zoom' },
        { s: 'leticia', m: 'angry', t: 'Tomasito está creciendo, Sofía. Tú ya estás grande. Aguántate tantito.' },
        { music: 'drama' },
        { s: 'sofia', m: 'sad', t: '...Siempre me toca aguantarme a mí.' },
      ],
    },
    after: {
      place: 'casa', music: 'drama',
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { t: 'Esa noche, Sofía le puso cinta al tenis por cuarta vez. Y le dibujó una estrellita encima.' },
        { s: 'sofia', m: 'sad', t: 'Aguanta un poquito más, ¿sí? Tú y yo somos iguales.' },
      ],
    },
  },

  'c1-4': {
    age: 8, weather: 'despejado', music: 'carrera',
    phrases: ['¡Dani viene atrás!', 'No lo dejes muy lejos', '¡Vamos, Dani!', '¡Corran!'],
    before: {
      place: 'barrio', music: 'alegre', scroll: 500,
      cast: [['sofia', 280], ['dani', 440, 'left', 'talk']],
      lines: [
        { s: 'dani', m: 'talk', t: 'Muy bien. Ya leí todo sobre correr. Tengo un plan.' },
        { s: 'sofia', m: 'shock', t: '¿Leíste... sobre correr?' },
        { s: 'dani', m: 'talk', t: 'En el periódico que envuelve los huevos de la tienda. Dice que hay que calentar y no comer chicharrones antes.' },
        { s: 'sofia', m: 'happy', t: '¿Entonces sí vas a correr conmigo?' },
        { s: 'dani', m: 'idle', t: 'Voy a intentarlo. No prometo llegar entero.' },
      ],
    },
    after: {
      place: 'barrio', music: 'alegre', scroll: 1400,
      cast: [['sofia', 440, 'left'], ['dani', 300, 'right', 'sad']],
      lines: [
        { s: 'dani', m: 'sad', t: '*jadeo*... Me caí cuatro veces. Una de ellas sin obstáculo.' },
        { s: 'sofia', m: 'talk', t: '¿Estás bien? Si quieres voy más despacio...' },
        { s: 'dani', m: 'happy', t: 'No. Tú corre como tú corres. Yo voy atrás.' },
        { music: 'reencuentro' },
        { s: 'dani', m: 'happy', t: 'Y siempre voy a estar ahí, Sofía. Aunque sea en segundo lugar.' },
        { t: 'Sofía no dijo nada. Desde ese día corrió un poquito más lento, para que el segundo lugar no quedara tan lejos.' },
      ],
    },
  },

  'c1-5': {
    age: 8, weather: 'atardecer', music: 'carrera',
    phrases: ['¿Y si sí puedes?', '¡Inténtalo!', 'Las piernas y las ganas', '¡Sigue!'],
    before: {
      place: 'tienda', music: 'alegre',
      cast: [['sofia', 260], ['dani', 420, 'left', 'cheer'], ['tata', 700, 'left']],
      lines: [
        { s: 'dani', m: 'cheer', t: '¡Sofía! ¡Mira lo que pegaron en la escuela!' },
        { t: '«CARRERA DE PRIMAVERA. CUARTO GRADO. VIERNES A LAS 10. PREMIO: MEDALLA».' },
        { s: 'dani', m: 'talk', t: '¡Tienes que entrar! Eres la más rápida de la cuadra. De la colonia, a lo mejor.' },
        { s: 'sofia', m: 'sad', t: 'No sé, Dani... Ahí van a correr niños de verdad. Con tenis de verdad.' },
        { s: 'dani', m: 'shock', t: '¿Y tú qué eres? ¿Niña de mentiras?' },
        { s: 'sofia', m: 'sad', t: 'Soy la niña del tenis con cinta. Se van a reír de mí.' },
        { s: 'tata', m: 'talk', t: 'Mija, los tenis no corren. Corren las piernas. Y las ganas.' },
        { s: 'dani', m: 'happy', t: '¿Ves? Lo dijo la Tata. Y la Tata nunca se equivoca.' },
        { s: 'sofia', m: 'idle', t: '...Lo voy a pensar.' },
      ],
    },
    after: {
      place: 'barrio', music: 'despertar', scroll: 1800,
      cast: [['sofia', 440, 'right', 'talk']],
      lines: [
        { s: 'sofia', m: 'sad', t: '¿Y si me caigo enfrente de todos? ¿Y si llego al último?' },
        { t: 'Corrió hasta que se hizo de noche, tratando de dejar atrás la pregunta. La pregunta corría igual de rápido.' },
        { s: 'sofia', m: 'happy', t: 'Bueno... a lo mejor sí me inscribo. A lo mejor.' },
      ],
    },
  },

  'c1-6': {
    age: 8, weather: 'sol', music: 'carrera',
    phrases: ['¡Tenis nuevos!', '¡Papá va a ir!', '¡Como nunca!', '¡Vuela, Sofía!'],
    before: {
      place: 'casa', music: 'alegre',
      cast: [['sofia', 260], ['ramiro', 620, 'left', 'cheer']],
      lines: [
        { s: 'ramiro', m: 'cheer', t: '¡Princesa! Me contó Dani que te inscribiste a una carrera.' },
        { s: 'sofia', m: 'shock', t: '¿Dani te dijo? ...Bueno, sí. Es el viernes.' },
        { s: 'ramiro', m: 'happy', t: 'Pues ahí va a estar tu papá. En primera fila. Gritando como en el estadio.' },
        { s: 'sofia', m: 'talk', t: '¿De verdad? ¿Me lo prometes?' },
        { s: 'ramiro', m: 'happy', t: 'Te lo prometo. Y mira lo que te traje...' },
        { t: 'Ramiro sacó una caja de zapatos. Adentro había unos tenis blancos con una raya roja. Olían a nuevo.' },
        { s: 'sofia', m: 'cheer', t: '¡Papá! ¡Son preciosos!', fx: 'flash' },
      ],
    },
    after: {
      place: 'barrio', music: 'despertar', scroll: 2200,
      cast: [['sofia', 440, 'right', 'cheer']],
      lines: [
        { s: 'sofia', m: 'cheer', t: '¡No hacen «plap»! ¡No hacen «plap»!' },
        { t: 'Esa tarde Sofía corrió como nunca. Con tenis nuevos y una promesa nueva.' },
        { s: 'sofia', m: 'happy', t: 'Papá va a ir. Papá va a ir. Papá va a ir.' },
      ],
    },
  },

  // Secreto: entre el 6 y el 7. Entrena para la carrera de la escuela.
  'c1-s': {
    age: 8, weather: 'jacaranda', music: 'secreto',
    phrases: ['¡Entrena!', '¡Otra vez!', '¡Ding! ¡Sigue!', '¡Por el viernes!'],
    before: {
      place: 'barrio', music: 'alegre', scroll: 2600,
      cast: [['sofia', 280], ['dani', 440, 'left', 'talk']],
      lines: [
        { t: 'Martes, 6 de la mañana. Faltan tres días para la carrera.' },
        { s: 'dani', m: 'talk', t: 'Aquí está tu plan de entrenamiento. Lo hice yo. Tiene dibujos.' },
        { s: 'sofia', m: 'shock', t: '¿Por qué hay un pollo dibujado?' },
        { s: 'dani', m: 'angry', t: 'Es un águila. Para que vueles.' },
        { s: 'dani', m: 'talk', t: 'Y este es el cronómetro oficial: el reloj de cocina de mi abuela. Cuando suene, terminaste.' },
        { s: 'sofia', m: 'cheer', t: '¡Listo, entrenador!' },
      ],
    },
    after: {
      place: 'barrio', music: 'alegre', scroll: 3000,
      cast: [['sofia', 440, 'right', 'happy'], ['dani', 600, 'left', 'cheer']],
      lines: [
        { s: 'dani', m: 'cheer', t: '¡Ding! Según el reloj de mi abuela, rompiste tu récord.' },
        { s: 'sofia', m: 'shock', t: '¿Cuál récord?' },
        { s: 'dani', m: 'talk', t: 'El que acabas de poner. Por eso se rompió tan fácil.' },
        { s: 'sofia', m: 'happy', t: 'El viernes voy a ganar, Dani. Por papá.' },
      ],
    },
  },

  'c1-7': {
    age: 8, weather: 'sol', music: 'final', correRate: 0.7,
    phrases: ['¡Por papá!', '¡No te alcanzan!', '¡La curva!', '¡Primer lugar!'],
    before: {
      place: 'carrera', music: 'tension', scroll: 200,
      cast: [['sofia', 280, 'right', 'sad'], ['dani', 420, 'left', 'cheer']],
      lines: [
        { t: 'Viernes, 10 de la mañana. La pista de la escuela huele a cal y a nervios.' },
        { s: 'sofia', m: 'talk', t: 'Dani... ¿ves a mi papá?' },
        { s: 'dani', m: 'talk', t: 'Todavía no. Pero seguro ya viene en camino.' },
        { s: 'sofia', m: 'sad', t: 'Me tiemblan las piernas.' },
        { s: 'dani', m: 'happy', t: 'Es normal. Así calientan solas. Lo leí en el periódico de los huevos.' },
        { s: 'sofia', m: 'angry', t: 'Bien. Por papá. Y por mis tenis nuevos.' },
        { music: 'final' },
        { t: '¡En sus marcas... listos... FUERA!', fx: 'flash' },
      ],
    },
    after: {
      place: 'carrera', music: 'ausencia', scroll: 1600,
      cast: [['sofia', 420, 'right', 'cheer'], ['dani', 260, 'right', 'happy']],
      lines: [
        { t: 'Fue reñido. Un niño de quinto casi la alcanza en la última curva. Pero Sofía llegó primero.' },
        { s: 'sofia', m: 'cheer', t: '¡GANÉ! ¡Papá, gané! ¡Papá, mira!' },
        { t: 'Sofía volteó a la primera fila. Había una mochila, una botella de agua y una silla vacía.' },
        { s: 'sofia', m: 'sad', t: '...¿Papá?' },
        { s: 'dani', m: 'talk', t: 'Yo sí vi todo, Sofía. Desde la salida hasta la meta. Todo.' },
        { s: 'sofia', m: 'cry', t: 'Me prometió que iba a estar...' },
        { t: 'La medalla era de plástico pintado de dorado. Ese día pesó como si fuera de oro.' },
      ],
    },
  },

  'c1-8': {
    age: 9, weather: 'calor', music: 'carrera',
    phrases: ['Que no te vean', '¡Sal de ahí!', '¡Más rápido!', 'Corre y no voltees'],
    before: {
      place: 'tienda', music: 'tension',
      cast: [['sofia', 230, 'right', 'sad'], ['leticia', 380, 'right'], ['tata', 700, 'left']],
      lines: [
        { t: 'Abarrotes La Esperanza. Fundada en 1987. Fiando desde 1987.' },
        { s: 'tata', m: 'talk', t: 'Buenas tardes, Leticia. ¿Lo de siempre?' },
        { s: 'leticia', m: 'talk', t: 'Sí, doña Tata. Arroz, aceite, huevos... y unas galletas para mi Tomasito. Apúntemelo, ¿sí?' },
        { s: 'tata', m: 'sad', t: 'Leticia... la cuenta ya va en tres hojas del cuaderno.' },
        { s: 'leticia', m: 'talk', t: 'El viernes le pago, se lo juro. Nada más me depositan.' },
        { s: 'tata', m: 'sad', t: 'Eso mismo me dijiste hace tres viernes.' },
        { s: 'sofia', m: 'sad', t: '(Que me trague la tierra... que me trague la tierra...)' },
        { s: 'leticia', m: 'angry', t: '¿Me va a fiar o no, doña Tata? Porque en la otra tienda sí me fían.', fx: 'zoom' },
        { s: 'tata', m: 'idle', t: '...Ándale, pues. Llévatelo.' },
        { exit: 'leticia' },
      ],
    },
    after: {
      place: 'tienda', music: 'drama',
      cast: [['sofia', 300, 'right', 'sad'], ['tata', 640, 'left']],
      lines: [
        { s: 'tata', m: 'talk', t: 'Tú no tienes la culpa, mija. Ándale, ve a correr.' },
        { s: 'sofia', m: 'sad', t: 'Perdón, Tata. Yo le voy a pagar cuando sea grande.' },
        { s: 'tata', m: 'happy', t: 'Cuando seas grande me pagas con una medalla de oro. De las de verdad.' },
      ],
    },
  },

  'c1-9': {
    age: 9, weather: 'viento', music: 'carrera',
    phrases: ['¡Con Dani!', 'No es una tontería', '¡Corre!', '¡Lejos de aquí!'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 250, 'right', 'angry'], ['ramiro', 600, 'left']],
      lines: [
        { s: 'sofia', m: 'angry', t: '¡Me lo prometiste! ¡En primera fila! ¡Y no fuiste!' },
        { s: 'ramiro', m: 'talk', t: 'Princesa, se me atravesó algo... un asunto importante...' },
        { s: 'sofia', m: 'angry', t: '¡¿Más importante que yo?!', fx: 'zoom' },
        { s: 'ramiro', m: 'sad', t: 'No digas eso... Te compré los tenis, ¿no?' },
        { s: 'sofia', m: 'cry', t: '¡No quería los tenis! ¡Te quería a ti en la primera fila!', fx: 'shake' },
        { enter: 'leticia', x: 760, face: 'left' },
        { s: 'leticia', m: 'angry', t: '¿Qué tanto gritan? Ya estuvo, Sofía. Tanto drama por una carrerita.' },
        { s: 'leticia', m: 'angry', t: 'Deja de perder el tiempo en tonterías. Mañana te vienes a ayudarme a vender gelatinas.' },
        { s: 'sofia', m: 'shock', t: '¿Tonterías? ¡Gané, mamá! ¡Gané!' },
        { s: 'leticia', m: 'idle', t: 'Ganaste una medalla de plástico. Eso no paga la luz.' },
        { music: 'ruptura' },
        { t: 'Sofía salió corriendo. Solo había un lugar donde quería estar: con Dani.' },
      ],
    },
    after: {
      place: 'noche', music: 'ruptura', scroll: 600,
      cast: [['sofia', 440, 'right', 'cry']],
      lines: [
        { t: 'Las luces de Abarrotes La Esperanza seguían prendidas.' },
        { s: 'sofia', m: 'cry', t: 'Dani... por favor, que esté Dani...' },
      ],
    },
  },

  'c1-10': {
    age: 9, weather: 'atardecer', music: 'perro', correRate: 0.7,
    phrases: ['¡No te detengas!', '¡Ahí vienen!', '¡Dani, por aquí!', '¡Más rápido!'],
    before: {
      place: 'tienda', music: 'tension',
      cast: [['sofia', 250, 'right', 'cry'], ['tata', 600, 'left'], ['dani', 760, 'left']],
      lines: [
        { s: 'sofia', m: 'cry', t: '¡Tata! ¿Está Dani? Es que mi mamá...' },
        { s: 'tata', m: 'sad', t: 'No, Sofía. Hoy no.' },
        { s: 'dani', m: 'shock', t: '¿Abuela?' },
        { s: 'tata', m: 'sad', t: 'Oigo los gritos de esa casa desde aquí, mija. Siempre los oigo.' },
        { s: 'tata', m: 'angry', t: 'Y no quiero esos problemas para mi Dani. Lo siento mucho, pero mejor ya no se junten.', fx: 'zoom' },
        { s: 'dani', m: 'angry', t: '¡Abuela, ella no tiene la culpa!' },
        { enter: 'leticia', x: 420, face: 'right' },
        { s: 'leticia', m: 'angry', t: '¡SOFÍA! ¡Te vienes conmigo ahorita mismo!', fx: 'shake' },
        { s: 'dani', m: 'angry', t: 'Sofía... ¡corre! ¡Yo voy contigo!' },
        { s: 'tata', m: 'shock', t: '¡Daniel! ¡Regresa aquí!' },
      ],
    },
    after: {
      place: 'parque', music: 'reencuentro', scroll: 1200,
      cast: [['sofia', 400, 'right', 'sad'], ['dani', 540, 'left', 'shock']],
      lines: [
        { t: 'Corrieron hasta dejar de oír sus nombres. Hasta que las calles se volvieron árboles.' },
        { s: 'dani', m: 'shock', t: '*jadeo*... ¿Dónde estamos?' },
        { s: 'sofia', m: 'talk', t: 'No sé. Nunca había visto este parque.' },
        { s: 'dani', m: 'sad', t: 'Mi abuela no es mala. Nada más tiene miedo.' },
        { s: 'sofia', m: 'sad', t: 'Ya sé. Todos le tienen miedo a mi casa. Yo también.' },
        { s: 'dani', m: 'happy', t: 'Entonces este parque es nuestro. Aquí no llega nadie con miedo.' },
        { s: 'sofia', m: 'happy', t: 'Nuestro parque secreto.' },
        { t: 'Fin del capítulo 1: «Me llamo Sofía».', fx: 'flash' },
      ],
    },
  },
};
