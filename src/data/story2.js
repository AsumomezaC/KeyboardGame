// Capítulo 2 «Los gatos» (10 a 12 años): Sofía conoce a Los Gatos, se aleja de Dani y descubre
// el parkour. Formato de las escenas: ver story1.js. Clasificación: 12+ (ver README).

export const STORY2 = {
  'c2-1': {
    age: 10, weather: 'atardecer', music: 'carrera',
    phrases: ['¡Otra ruta!', '¿Qué hay por aquí?', '¡Explora!', '¡Sigue!'],
    before: {
      place: 'parque', music: 'alegre', scroll: 300,
      cast: [['sofia', 300, 'right', 'happy'], ['dani', 520, 'left', 'sad']],
      lines: [
        { t: 'Dos años después. Sofía tiene 10. Ella y Dani entrenan todas las tardes en su parque secreto.' },
        { s: 'dani', m: 'sad', t: 'Hoy no puedo, Sofía. Mi abuela me puso a contar los chiles en lata de la bodega.' },
        { s: 'sofia', m: 'shock', t: '¿Todos?' },
        { s: 'dani', m: 'sad', t: 'Todos. Uno por uno. Hasta los que tienen la etiqueta rota.' },
        { s: 'sofia', m: 'happy', t: 'Entonces corro por los dos. Hoy pruebo otra ruta.' },
      ],
    },
    after: {
      place: 'prohibida', music: 'gatos', scroll: 1300,
      cast: [['sofia', 240, 'right', 'shock'], ['kevin', 600, 'left'], ['chuy', 720, 'left'], ['yesi', 830, 'left']],
      lines: [
        { t: 'Detrás del deportivo abandonado, Sofía vio algo que nunca había visto.' },
        { t: 'Unos chicos saltaban de barda en barda, rodaban por el suelo y se levantaban corriendo. Como gatos.' },
        { s: 'sofia', m: 'shock', t: '(Son Los Gatos... los que rayan las paredes. Mi mamá dice que son malandros.)' },
        { s: 'chuy', m: 'shock', t: '¡Ey! ¿Quién anda ahí?' },
        { s: 'kevin', m: 'talk', t: '¿Y tú qué ves, flaca?' },
        { t: 'Sofía no contestó. Dio media vuelta y corrió. Sabía que esos chicos no eran buena gente.' },
        { t: 'Pero también sabía que nunca había visto a nadie moverse así.' },
      ],
    },
  },

  'c2-2': {
    age: 10, weather: 'despejado', music: 'carrera',
    phrases: ['¡Dani viene atrás!', '¿En qué piensas?', '¡Concéntrate!', '¡Corre!'],
    before: {
      place: 'parque', music: 'alegre', scroll: 700,
      cast: [['sofia', 300, 'right', 'idle'], ['dani', 460, 'left', 'happy']],
      lines: [
        { s: 'dani', m: 'happy', t: '¡Volví! Ochocientos doce chiles en lata. Los conté dos veces.' },
        { s: 'sofia', m: 'idle', t: 'Ajá...' },
        { s: 'dani', m: 'talk', t: 'Y luego llegó un ovni y se llevó a mi abuela.' },
        { s: 'sofia', m: 'idle', t: 'Ajá...' },
        { s: 'dani', m: 'shock', t: '¡Sofía! ¿Me estás oyendo?', fx: 'zoom' },
        { s: 'sofia', m: 'shock', t: 'Perdón. Es que ayer vi a unos chicos que saltaban bardas. Corrían por las paredes, Dani.' },
        { s: 'dani', m: 'angry', t: '¿Los Gatos? Esos son los que se robaron las llantas del camión del gas.' },
        { s: 'sofia', m: 'talk', t: 'Eso nadie lo comprobó.' },
        { s: 'dani', m: 'sad', t: '...Bueno. ¿Corremos?' },
      ],
    },
    after: {
      place: 'parque', music: 'gatos', scroll: 1500,
      cast: [['sofia', 440, 'right', 'idle'], ['dani', 300, 'right', 'sad']],
      lines: [
        { t: 'Esa tarde Sofía le ganó a Dani por media cuadra. Pero tenía la cabeza en otro lado.' },
        { s: 'sofia', m: 'talk', t: '(Si yo pudiera saltar así... nadie me alcanzaría nunca.)' },
      ],
    },
  },

  'c2-3': {
    age: 10, weather: 'nublado', music: 'gatos',
    phrases: ['¡No lo pierdas de vista!', '¡Síguelo!', '¡Demuéstralo!', '¡Más rápido!'],
    before: {
      place: 'prohibida', music: 'gatos', scroll: 300,
      cast: [['sofia', 240], ['kevin', 540, 'left'], ['yesi', 640, 'left', 'angry'], ['chuy', 740, 'left'], ['brayan', 840, 'left']],
      lines: [
        { t: 'Al día siguiente Dani tenía que ayudar en la tienda. Sofía regresó sola al deportivo.' },
        { s: 'sofia', m: 'talk', t: 'Hola... Me llamo Sofía. Quiero aprender lo que ustedes hacen.' },
        { s: 'yesi', m: 'angry', t: 'Mira nada más. La niña que salió corriendo el otro día.' },
        { s: 'brayan', m: 'cheer', t: '¡Iba tan rápido que casi se le salen los tenis!' },
        { s: 'kevin', m: 'talk', t: 'Aquí no entra cualquiera. Si quieres ser de Los Gatos, sígueme. Si me pierdes de vista, te vas.' },
        { s: 'sofia', m: 'angry', t: 'No te voy a perder de vista.' },
      ],
    },
    after: {
      place: 'prohibida', music: 'amor', scroll: 1400,
      cast: [['sofia', 300, 'right', 'happy'], ['kevin', 460, 'left'], ['chuy', 640, 'left', 'shock'], ['yesi', 760, 'left', 'angry']],
      lines: [
        { s: 'chuy', m: 'shock', t: '¡No manches! ¡No lo perdió ni una vez!' },
        { s: 'kevin', m: 'happy', t: 'Nada mal, flaca. Nada mal.' },
        { s: 'yesi', m: 'angry', t: '...Hmph.' },
        { s: 'sofia', m: 'happy', t: '(Me dijo «nada mal»...)' },
      ],
    },
  },

  'c2-4': {
    age: 10, weather: 'atardecer', music: 'gatos',
    phrases: ['¡Cae bonito!', '¡Rueda y sigue!', '¡Vamos, Ráfaga!', '¡Salta!'],
    before: {
      place: 'prohibida', music: 'gatos', scroll: 800,
      cast: [['sofia', 260], ['kevin', 420, 'left', 'talk'], ['yesi', 640, 'left'], ['memo', 760, 'left']],
      lines: [
        { s: 'kevin', m: 'talk', t: 'Mira, flaca. El secreto no es saltar alto. Es caer bonito.' },
        { t: 'Sofía saltó, rodó por el pasto y se levantó corriendo. Como si lo hubiera hecho toda la vida.' },
        { s: 'kevin', m: 'cheer', t: '¡Eso! Desde hoy te vamos a decir... la Ráfaga.' },
        { s: 'yesi', m: 'angry', t: '¿Ráfaga? A mí me tardaron tres meses en ponerme apodo.' },
        { s: 'memo', m: 'talk', t: 'Y te pusieron «la Yesi». Que es tu nombre.' },
        { s: 'yesi', m: 'angry', t: '¡Cállate, Memo!', fx: 'shake' },
      ],
    },
    after: {
      place: 'barrio', music: 'amor', scroll: 1600,
      cast: [['sofia', 360, 'right', 'happy'], ['kevin', 500, 'left'], ['yesi', 820, 'left', 'angry']],
      lines: [
        { s: 'kevin', m: 'talk', t: 'Te acompaño a tu esquina, Ráfaga.' },
        { s: 'sofia', m: 'happy', t: '...Bueno.' },
        { t: 'No hablaron de nada importante. A Sofía le pareció la plática más importante de su vida.' },
        { s: 'yesi', m: 'angry', t: '(Disfrútalo mientras dure, Ráfaga.)', fx: 'zoom' },
      ],
    },
  },

  // Secreto: entre el 4 y el 5. Dani espera a Sofía en el parque y corre solo.
  'c2-s': {
    age: 10, weather: 'llovizna', music: 'soledad',
    phrases: ['¿Dónde estás, Sofía?', '¡Sigue, Dani!', 'Como ella te enseñó', '¡Levántate!'],
    before: {
      place: 'parque', music: 'soledad', scroll: 900,
      cast: [['dani', 420, 'right', 'sad']],
      lines: [
        { t: 'Mientras tanto, en el parque secreto...' },
        { s: 'dani', m: 'sad', t: 'Cinco y media. Seis. Seis y cuarto.' },
        { s: 'dani', m: 'talk', t: 'A lo mejor se le olvidó. A lo mejor le pasó algo. A lo mejor... yo hice algo mal.' },
        { s: 'dani', m: 'angry', t: 'Bueno. Entonces corro yo. Como ella me enseñó.' },
      ],
    },
    after: {
      place: 'parque', music: 'soledad', scroll: 1300,
      cast: [['dani', 420, 'right', 'sad']],
      lines: [
        { s: 'dani', m: 'sad', t: '*jadeo*... Me caí tres veces. Y ni así se me quitó la pregunta.' },
        { s: 'dani', m: 'cry', t: '¿Qué te hice, Sofía?' },
        { t: 'El parque no contestó. Los parques nunca contestan.' },
      ],
    },
  },

  'c2-5': {
    age: 11, weather: 'viento', music: 'carrera',
    phrases: ['No voltees', 'Corre aunque duela', '¡Contra el viento!', '¡Sigue!'],
    before: {
      place: 'parque', music: 'tension', scroll: 500,
      cast: [['sofia', 300, 'right', 'idle'], ['dani', 620, 'left', 'angry']],
      lines: [
        { s: 'dani', m: 'angry', t: 'Once días, Sofía. Once tardes esperándote en el parque.' },
        { s: 'sofia', m: 'talk', t: 'Ya te dije que andaba ocupada.' },
        { s: 'dani', m: 'angry', t: '¿Ocupada con Los Gatos? Te vi con ellos. Con la sudadera de Kevin puesta.' },
        { s: 'sofia', m: 'angry', t: '¿Y qué? Ellos sí saben hacer cosas. Tú te caes hasta caminando.', fx: 'zoom' },
        { s: 'dani', m: 'sad', t: '...Yo te dije que siempre iba a estar ahí.' },
        { s: 'sofia', m: 'angry', t: '¡Pues ya no te necesito ahí! ¡Ya no vamos a ser amigos, Dani!', fx: 'shake' },
        { music: 'ruptura' },
        { s: 'dani', m: 'cry', t: 'Entonces vete. Y no vuelvas al parque. Ni a la tienda. Ni a nada.' },
        { t: 'Dani se dio la vuelta. Sofía también. El parque secreto se quedó sin nadie.' },
      ],
    },
    after: {
      place: 'noche', music: 'gatos', scroll: 900,
      cast: [['sofia', 300, 'right', 'sad'], ['kevin', 480, 'left'], ['chuy', 620, 'left']],
      lines: [
        { s: 'kevin', m: 'talk', t: '¿Qué traes, Ráfaga?' },
        { s: 'sofia', m: 'sad', t: 'Nada. Me peleé con alguien.' },
        { s: 'kevin', m: 'happy', t: 'Pues ya no lo necesitas. Ahora nos tienes a nosotros.' },
        { t: 'Sofía quiso creerle. Casi lo logró.' },
      ],
    },
  },

  'c2-6': {
    age: 11, weather: 'frio', music: 'gatos',
    phrases: ['¡Aguas!', '¡Que no te vean!', '¡Por aquí, Ráfaga!', '¡Más rápido!'],
    before: {
      place: 'noche', music: 'gatos', scroll: 400,
      cast: [['sofia', 280], ['kevin', 460, 'left', 'talk'], ['chuy', 620, 'left']],
      lines: [
        { s: 'kevin', m: 'talk', t: 'Toma, Ráfaga. Toda gata deja su firma.' },
        { t: 'Kevin le dio una lata de pintura en aerosol.' },
        { s: 'sofia', m: 'shock', t: '¿En la pared de don Ruperto? Pero si don Ruperto es buena gente...' },
        { s: 'kevin', m: 'happy', t: 'Por eso. Así se va a acordar de nosotros.' },
        { s: 'sofia', m: 'sad', t: '...Bueno.' },
        { t: 'Sofía pintó un gato. Le salió chueco. Con cara de perro.' },
        { s: 'chuy', m: 'shock', t: '¡Aguas! ¡Ahí viene don Ruperto con la escoba!', fx: 'shake' },
      ],
    },
    after: {
      place: 'noche', music: 'drama', scroll: 1300,
      cast: [['sofia', 360, 'right', 'happy'], ['kevin', 500, 'left', 'cheer']],
      lines: [
        { s: 'kevin', m: 'cheer', t: '¡Eso estuvo épico, Ráfaga!' },
        { s: 'sofia', m: 'happy', t: '¡Sí! ¡Épico!' },
        { s: 'sofia', m: 'sad', t: '(...Don Ruperto me regalaba paletas cuando era chiquita.)' },
        { t: 'Esa noche le costó dormir. El gato chueco no se le borraba de la cabeza.' },
      ],
    },
  },

  'c2-7': {
    age: 11, weather: 'niebla', music: 'perro', correRate: 0.7,
    phrases: ['¡Ahí viene!', '¡No te detengas!', '¡Salta!', '¿Dónde están?'],
    before: {
      place: 'prohibida', music: 'gatos', scroll: 300,
      cast: [['sofia', 240], ['kevin', 420, 'left'], ['yesi', 540, 'left'], ['chuy', 650, 'left']],
      lines: [
        { t: 'Sofía tiene 11 años. Es la más rápida de Los Gatos.' },
        { s: 'kevin', m: 'talk', t: 'Ráfaga, hoy entramos a la vieja fábrica. Dicen que adentro hay cobre que vale buena lana.' },
        { s: 'sofia', m: 'shock', t: 'Kevin... ahí dice PROHIBIDO EL PASO.' },
        { s: 'yesi', m: 'angry', t: '¿Tienes miedo, Ráfaga? Las gatas de verdad no tienen miedo.' },
        { s: 'kevin', m: 'happy', t: 'Vamos juntos. Yo te cuido.' },
        { music: 'peligro' },
        { t: 'Saltaron la malla. Del otro lado, algo gruñó en la niebla.' },
        { enter: 'perro', x: 830, face: 'left' },
        { s: 'perro', t: '¡GRRRRRRRR!', fx: 'shake' },
        { s: 'kevin', m: 'shock', t: '¡El perro! ¡Córranle!' },
      ],
    },
    after: {
      place: 'prohibida', music: 'drama', scroll: 1700,
      cast: [['sofia', 360, 'right', 'cry']],
      lines: [
        { s: 'sofia', m: 'cry', t: '*jadeo*... ¿Kevin? ¿Yesi? ¿Chuy?' },
        { t: 'Nadie. La dejaron sola con el perro.' },
        { enter: 'kevin', x: 600, face: 'left' },
        { s: 'kevin', m: 'talk', t: '¡Ráfaga! ¡Qué bueno que saliste! Te busqué por todos lados, te lo juro.' },
        { s: 'sofia', m: 'sad', t: 'Te fuiste...' },
        { s: 'kevin', m: 'talk', t: 'Fue sin querer. Pensé que venías detrás de mí. ¿Cómo crees que te iba a dejar?' },
        { s: 'sofia', m: 'happy', t: '...Sí. Fue sin querer. Tú nunca me harías eso.' },
        { t: 'Sofía le creyó. Porque creerle dolía menos que no creerle.' },
      ],
    },
  },

  'c2-8': {
    age: 11, weather: 'viento', music: 'despertar',
    phrases: ['Siente el aire', 'Sin miedo', '¿Te acuerdas?', '¡Respira!'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 250, 'right', 'sad'], ['leticia', 600, 'left'], ['ramiro', 770, 'left']],
      lines: [
        { s: 'sofia', m: 'sad', t: 'Mamá... ayer me persiguió un perro enorme. Tuve mucho miedo.' },
        { s: 'leticia', m: 'idle', t: '¿Y qué hacías donde hay perros enormes? Ahí está. Por andar de vaga.' },
        { s: 'ramiro', m: 'talk', t: 'Los perros huelen el miedo, princesa. Tienes que oler a valiente.' },
        { s: 'sofia', m: 'sad', t: '...' },
        { t: 'Nadie le preguntó si estaba bien. Sofía salió a la calle sin decir nada.' },
      ],
    },
    after: {
      place: 'barrio', music: 'despertar', scroll: 900,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { s: 'sofia', m: 'sad', t: 'Me da miedo correr. Siento que algo me va a alcanzar.' },
        { t: 'Pero el viento sopló igual que aquel sábado, cuando tenía 8 años.' },
        { s: 'sofia', m: 'happy', t: '...Ah. Ya me acordé por qué empecé.', fx: 'flash' },
      ],
    },
  },

  'c2-9': {
    age: 12, weather: 'nublado', music: 'gatos',
    phrases: ['¡Aguántales el paso!', '¿Qué está pasando?', '¡Sigue!', '¡Demuéstralo!'],
    before: {
      place: 'prohibida', music: 'tension', scroll: 600,
      cast: [['sofia', 260, 'right', 'cheer'], ['yesi', 540, 'left'], ['chuy', 650, 'left'], ['brayan', 750, 'left'], ['memo', 850, 'left']],
      lines: [
        { s: 'sofia', m: 'cheer', t: '¡Ya volví! Perdón por faltar. Ya se me quitó el susto.' },
        { s: 'yesi', m: 'idle', t: 'Mira nada más. Volvió la Ráfaga.' },
        { s: 'chuy', m: 'sad', t: '...Hola, Ráfaga.' },
        { s: 'sofia', m: 'talk', t: '¿Y Kevin?' },
        { s: 'brayan', m: 'idle', t: 'Anda... ocupado.' },
        { s: 'memo', m: 'sad', t: 'Mejor no preguntes, Ráfaga.' },
        { s: 'yesi', m: 'angry', t: 'Si vas a correr con nosotros, aguántanos el paso. Ya no te vamos a esperar.' },
      ],
    },
    after: {
      place: 'prohibida', music: 'tension', scroll: 1500,
      cast: [['sofia', 360, 'right', 'shock']],
      lines: [
        { s: 'sofia', m: 'talk', t: '¿Por qué todos me ven raro?' },
        { t: 'Nadie le contestó. Pero todos sabían algo que ella no.' },
      ],
    },
  },

  'c2-10': {
    age: 12, weather: 'lluvia', music: 'perro', correRate: 0.7,
    phrases: ['¡No escuches!', '¡Lejos de aquí!', '¡No te detengas!', '¡Más rápido!'],
    before: {
      place: 'noche', music: 'tension', scroll: 500,
      cast: [['sofia', 260, 'right', 'happy'], ['kevin', 600, 'left'], ['yesi', 690, 'left', 'happy']],
      lines: [
        { t: 'Esa noche, en la azotea de siempre, Sofía encontró a Kevin. No estaba solo.' },
        { s: 'yesi', m: 'happy', t: 'Ay, Ráfaga. ¿Nadie te contó? Kevin y yo andamos desde hace un año.' },
        { s: 'sofia', m: 'shock', t: '¿Un... año?', fx: 'zoom' },
        { s: 'kevin', m: 'talk', t: 'Ráfaga, espérate. No es lo que parece...' },
        { s: 'yesi', m: 'angry', t: 'Es justo lo que parece. Te traía de mandadera porque corres rápido. Nada más.' },
        { music: 'ruptura' },
        { s: 'sofia', m: 'cry', t: 'Me dijiste que era de la familia... que tú me cuidabas...' },
        { s: 'kevin', m: 'talk', t: 'Déjame explicarte...' },
        { s: 'sofia', m: 'cry', t: '¡No quiero oír nada!', fx: 'shake' },
      ],
    },
    after: {
      place: 'noche', music: 'ruptura', scroll: 1600,
      cast: [['sofia', 420, 'right', 'cry']],
      lines: [
        { t: 'Sofía corrió hasta perderlo. Hasta que Kevin dejó de gritar su nombre.' },
        { s: 'sofia', m: 'cry', t: 'Era mentira. Todo era mentira.' },
        { t: 'Se quitó la sudadera de Los Gatos y la dejó en una banca. Hacía frío. No le importó.' },
        { t: 'Fin del capítulo 2: «Los gatos».', fx: 'flash' },
      ],
    },
  },
};
