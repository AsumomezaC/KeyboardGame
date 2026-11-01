// Historia del capítulo 1: diálogos antes y después de cada nivel, clima, música y frases de carrera.
// Tono: telenovela mexicana y K-drama exagerados. Clasificación: 12+ (ver README).
//
// Cada escena tiene un lugar ('casa' o un ambiente de fondo), personajes en escena y líneas:
//   { s: 'ramiro', m: 'angry', t: 'Texto', fx: 'shake' }  habla un personaje (m = gesto, fx = efecto)
//   { t: 'Texto' }                                         narrador
//   { music: 'drama' }                                     cambia la música
//   { enter: 'dani', x: 640, face: 'left' }                entra alguien caminando
//   { exit: 'kevin' }                                      sale de escena
// Gestos: idle, talk, sad, angry, cry, shock, happy, cheer. Efectos: shake, zoom, flash.
// Personajes en escena: [id, x, 'left' | 'right', gesto inicial].
//
// Dani nunca tiene género definido: no usar adjetivos con género para Dani.

export const CAST = {
  sofia: { name: 'Sofía' },
  ramiro: { name: 'Papá' },
  leticia: { name: 'Mamá' },
  tomasito: { name: 'Tomasito' },
  dani: { name: 'Dani' },
  kevin: { name: 'Kevin' },
  yesi: { name: 'Yesi' },
  chuy: { name: 'Chuy' },
  brayan: { name: 'Brayan' },
  memo: { name: 'Memo' },
  panadero: { name: 'Don Chema' },
  perro: { name: 'Perro guardián', sprite: 'dog', frame: 'bark' },
};

// Frase común al terminar un obstáculo; cada nivel la mezcla con las suyas (correRate = qué tanto sale).
export const CORRE = '¡Corre!';

export const STORY1 = {
  'c1-1': {
    age: 8, weather: 'sol', music: 'carrera',
    phrases: ['¡No mires atrás!', 'Respira... ¡y corre!', 'Siente el aire', '¡Lejos de los gritos!', '¡Más rápido!'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 260], ['ramiro', 600, 'left'], ['leticia', 760, 'left', 'angry']],
      lines: [
        { t: 'Sábado, 2 de la tarde. En casa de Sofía el aire pesa más que la tarea de matemáticas.' },
        { s: 'leticia', m: 'angry', t: '¡Ramiro! ¡¿Otra vez el dinero del gas?! ¡Hago doble turno en el hospital para ESTO!', fx: 'shake' },
        { s: 'ramiro', m: 'talk', t: 'Leti, mi reina... lo aposté al fútbol. Era una inversión. ¡Hip!' },
        { s: 'leticia', m: 'angry', t: '¡Tu equipo perdió, Ramiro! ¡Como pierdes todo lo que tocas!' },
        { s: 'sofia', m: 'sad', t: 'Mamá... papá... ya no griten. Tomasito está dormido.' },
        { s: 'leticia', m: 'angry', t: '¡Tú no te metas, Sofía! Y tus tenis rotos se quedan así. No hay dinero. ¡NO HAY!', fx: 'zoom' },
        { s: 'ramiro', m: 'happy', t: 'No le hables así a mi princesa... ven, dale un abrazo a papi...' },
        { s: 'sofia', m: 'shock', t: '¡Hueles a cantina!', fx: 'zoom' },
        { music: 'ruptura' },
        { t: 'Algo dentro de Sofía se rompió. Como sus tenis. Como el vidrio del cuadro familiar.' },
        { s: 'sofia', m: 'cry', t: '¡LOS ODIO! ¡A LOS DOS!', fx: 'shake' },
        { t: 'Y salió corriendo, sin mirar atrás.' },
      ],
    },
    after: {
      place: 'barrio', music: 'despertar', scroll: 900,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { t: 'El sol brillaba como si nada hubiera pasado. Qué descaro el del cielo.' },
        { s: 'sofia', m: 'cry', t: '*snif*... Corrí tanto que ya no sé ni dónde estoy...' },
        { s: 'sofia', m: 'sad', t: 'Pero el aire en la cara... se sintió como si nada pudiera alcanzarme.' },
        { s: 'sofia', m: 'cheer', t: '¡Estoy viva! ¡Correr me hace sentir VIVA!', fx: 'flash' },
        { t: 'Ese día, una niña de 8 años descubrió dos cosas: que sus tenis estaban rotos... y que no le importaba.' },
      ],
    },
  },

  'c1-2': {
    age: 8, weather: 'jacaranda', music: 'carrera',
    phrases: ['¡Gánale a Dani!', '¡Hasta la tienda!', 'El último es huevo podrido', '¡Vuela!'],
    before: {
      place: 'barrio', music: 'alegre', scroll: 300,
      cast: [['sofia', 280], ['tomasito', 400, 'left', 'cheer'], ['leticia', 640, 'left']],
      lines: [
        { t: 'Una semana después. Las jacarandas pintan la calle de morado, como si quisieran pedir perdón por todos.' },
        { s: 'tomasito', m: 'cheer', t: '¡Sofi! ¡Sofi! ¡Soy un TIRANOSAURIO! ¡RAAAWR!' },
        { s: 'sofia', m: 'happy', t: '¡Ay no, un T-Rex! ¡Corre por tu vida, Tomasito!' },
        { s: 'leticia', m: 'angry', t: '¡Sofía! No lo hagas correr, que se cae. Mi niño es muy delicado.' },
        { s: 'leticia', m: 'happy', t: 'Tomasito, mi rey, mi cielito, mi tesoro... ten, te compré otro dinosaurio.' },
        { s: 'tomasito', m: 'cheer', t: '¡Un estegosaurio! ¡Mamá es la mejor del mundo mundial!' },
        { s: 'sofia', m: 'sad', t: '¿Y mis tenis, mamá...?' },
        { s: 'leticia', m: 'talk', t: 'Ya te dije que no hay dinero. Me voy, tengo guardia. Cuida a tu hermano.' },
        { exit: 'leticia' },
        { s: 'sofia', m: 'sad', t: 'Para Tomasito siempre hay dinero...' },
        { enter: 'dani', x: 620, face: 'left' },
        { s: 'dani', m: 'happy', t: '¡Sofía! ¿Otra vez con cara de telenovela de las nueve?' },
        { s: 'sofia', m: 'shock', t: '¡Dani! ¿Desde cuándo estás ahí?' },
        { s: 'dani', m: 'talk', t: 'Vivo aquí al lado desde que teníamos 3 años. Y siempre me asomo cuando oigo gritos.' },
        { s: 'dani', m: 'happy', t: 'Mi abuela dice que hay que llorar corriendo, así las lágrimas se secan solas. ¿Una carrerita hasta la tienda?' },
        { s: 'sofia', m: 'cheer', t: '¡El que llegue al último es huevo podrido!' },
      ],
    },
    after: {
      place: 'barrio', music: 'alegre', scroll: 1200,
      cast: [['sofia', 460, 'right', 'happy'], ['dani', 300, 'right', 'shock']],
      lines: [
        { s: 'dani', m: 'shock', t: '*jadeo*... ¿Cómo... corres... tan rápido... con los tenis rotos?' },
        { s: 'sofia', m: 'happy', t: 'No sé. Cuando corro, mis pies no escuchan a nadie.' },
        { s: 'dani', m: 'talk', t: 'Pues tus pies son unos maleducados. ¡Mañana revancha! A las 5 en la esquina.' },
        { s: 'sofia', m: 'cheer', t: '¡Hecho!' },
        { t: 'Desde la ventana, Tomasito los miraba con su estegosaurio en la mano. No entendía nada. Y eso estaba bien.' },
      ],
    },
  },

  'c1-3': {
    age: 8, weather: 'llovizna', music: 'carrera', companion: 'dani',
    phrases: ['¡Dani te alcanza!', 'La lluvia hace cosquillas', '¡No te detengas!', '¡Que Dani no te gane!'],
    before: {
      place: 'barrio', music: 'alegre', scroll: 600,
      cast: [['sofia', 260], ['dani', 380, 'left'], ['ramiro', 720, 'left']],
      lines: [
        { t: 'Está chispeando. Sofía y Dani entrenan en la esquina, como cada tarde desde hace meses.' },
        { s: 'dani', m: 'happy', t: 'Mi abuela dice que la lluvia chiquita no moja, solo hace cosquillas.' },
        { s: 'ramiro', m: 'cheer', t: '¡Ey, mi princesa! ¡Corres como el viento! Igualita a tu padre cuando era joven...' },
        { s: 'sofia', m: 'talk', t: 'Papá... ¿vas a ir el viernes a la carrera de la escuela? Es a las 10.' },
        { s: 'ramiro', m: 'happy', t: '¡Claro que sí! En primera fila. Te lo juro por... por esta botella.' },
        { s: 'dani', m: 'shock', t: 'Ese juramento no suena muy confiable, don Ramiro.' },
        { s: 'ramiro', m: 'angry', t: '¡Tú no sabes nada de la vida, Dani! ¡Hip!' },
        { s: 'sofia', m: 'sad', t: 'Vámonos, Dani. Mejor corremos.' },
        { s: 'dani', m: 'cheer', t: '¡Te sigo! Esta vez sí te alcanzo.' },
      ],
    },
    after: {
      place: 'barrio', music: 'ausencia', weather: 'despejado', scroll: 1500,
      cast: [['sofia', 420, 'right', 'cheer'], ['dani', 260, 'right', 'happy']],
      lines: [
        { t: 'Viernes, 10 de la mañana. Carrera de la escuela.' },
        { t: 'Sofía ganó. Primer lugar. Una medalla de plástico pintada de dorado.' },
        { s: 'sofia', m: 'cheer', t: '¡Papá, mira! ¡Gané! ...¿Papá?' },
        { t: 'La primera fila estaba vacía.' },
        { s: 'sofia', m: 'sad', t: '...' },
        { s: 'dani', m: 'talk', t: 'Yo sí vine. Grité tanto que casi me quedo sin voz.' },
        { s: 'sofia', m: 'cry', t: 'Dani... eres la única persona que siempre llega.' },
        { s: 'dani', m: 'happy', t: 'Y siempre voy a llegar. Aunque sea en segundo lugar.' },
      ],
    },
  },

  'c1-4': {
    age: 10, weather: 'nublado', music: 'carrera',
    phrases: ['¡Sal de ahí!', '¡No llores, corre!', '¡Más lejos!', 'Que nadie te alcance'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 240], ['tomasito', 340, 'right'], ['leticia', 620, 'left', 'angry'], ['ramiro', 790, 'left']],
      lines: [
        { t: 'Dos años después. Sofía tiene 10. Su papá ya no tiene trabajo.' },
        { s: 'leticia', m: 'angry', t: '¡¿Que te CORRIERON?! ¡¿Otra vez, Ramiro?!', fx: 'zoom' },
        { s: 'ramiro', m: 'talk', t: 'El patrón no aprecia a los artistas, Leti. Yo nací para cosas grandes.' },
        { s: 'leticia', m: 'angry', t: '¡Para cosas grandes nació tu barriga!', fx: 'shake' },
        { s: 'tomasito', m: 'talk', t: 'Mami, ¿por qué gritas? ¿Es un juego? ¿Puedo jugar?' },
        { s: 'leticia', m: 'happy', t: 'No, mi vida, mi rey. Ve a ver tus caricaturas.' },
        { s: 'leticia', m: 'angry', t: 'Sofía: desde hoy tú recoges a tu hermano, haces la comida y lavas la ropa.' },
        { s: 'sofia', m: 'shock', t: '¡Pero tengo entrenamiento con Dani!' },
        { s: 'leticia', m: 'angry', t: '¡¿Entrenamiento?! ¡Correr no da de comer! ¡Eres igualita a tu padre!', fx: 'zoom' },
        { music: 'drama' },
        { s: 'sofia', m: 'cry', t: '...Ojalá no fuera hija de nadie.' },
        { t: 'La puerta azotó tan fuerte que el cuadro familiar se cayó. Nadie lo levantó.' },
      ],
    },
    after: {
      place: 'barrio', music: 'gatos', scroll: 2000,
      cast: [['sofia', 260, 'right', 'sad'], ['kevin', 580, 'left'], ['yesi', 700, 'left'], ['chuy', 800, 'left'], ['brayan', 890, 'left']],
      lines: [
        { t: 'Sofía corrió hasta el viejo deportivo abandonado. No estaba sola.' },
        { t: 'Un chico saltó de una barda a otra como si el aire lo cargara.' },
        { s: 'kevin', m: 'cheer', t: '¿Y tú qué me ves, flaca? ¿Nunca habías visto volar a un gato?' },
        { s: 'sofia', m: 'shock', t: '¿C-cómo hiciste eso?' },
        { s: 'kevin', m: 'talk', t: 'Parkour. Se trata de que nada te detenga. Ni bardas, ni reglas, ni papás.' },
        { music: 'amor' },
        { t: 'Y en ese momento, en algún lugar, sonó un violín. Bueno, no. Pero así se sintió.', fx: 'flash' },
        { s: 'yesi', m: 'angry', t: 'Kevin, ¿y esta quién es? Se ve que ni sabe amarrarse las agujetas.' },
        { s: 'kevin', m: 'talk', t: 'Tranquila, Yesi. La vi correr. Es rápida.' },
        { s: 'kevin', m: 'happy', t: 'Somos Los Gatos. Si quieres aprender, ven mañana. Si no, ni nos conoces.' },
        { s: 'chuy', m: 'cheer', t: '¡Miau, miau!' },
        { s: 'sofia', m: 'happy', t: '...Mañana. Aquí voy a estar.' },
      ],
    },
  },

  'c1-5': {
    age: 10, weather: 'atardecer', music: 'carrera',
    phrases: ['¡Demuestra quién eres!', '¡Antes de que se meta el sol!', '¡Vuela!', '¡Sin miedo!'],
    before: {
      place: 'barrio', music: 'gatos', scroll: 2400,
      cast: [['sofia', 260], ['kevin', 520, 'left'], ['yesi', 620, 'left', 'angry'], ['chuy', 720, 'left'], ['brayan', 810, 'left'], ['memo', 900, 'left']],
      lines: [
        { t: 'Los Gatos entrenan en las azoteas cuando el sol se mete y el barrio se pinta de naranja.' },
        { s: 'brayan', m: 'cheer', t: '¡Ey, la nueva ya brinca charcos sin mojarse! ¡Uy, qué miedo!' },
        { s: 'memo', m: 'talk', t: 'Yo apuesto mi torta a que se cae.' },
        { s: 'yesi', m: 'angry', t: 'Nadie entra a Los Gatos sin prueba. Haz el circuito antes de que se meta el sol.' },
        { s: 'kevin', m: 'talk', t: 'Yesi, no seas así...' },
        { s: 'yesi', m: 'shock', t: '¿Qué? ¿Ahora la defiendes? ¿Desde cuándo, Kevin? ¡¿DESDE CUÁNDO?!', fx: 'zoom' },
        { s: 'sofia', m: 'angry', t: 'No necesito que nadie me defienda. ¿Dónde empieza?' },
        { s: 'kevin', m: 'cheer', t: 'Esa es mi gata.' },
      ],
    },
    after: {
      place: 'barrio', music: 'amor', scroll: 2800,
      cast: [['sofia', 300, 'right', 'happy'], ['kevin', 520, 'left'], ['yesi', 640, 'left', 'angry'], ['chuy', 740, 'left', 'shock'], ['memo', 850, 'left', 'sad']],
      lines: [
        { s: 'chuy', m: 'shock', t: '¡No manches! ¡Lo hizo en tiempo récord!' },
        { s: 'memo', m: 'sad', t: '...Adiós, mi torta.' },
        { s: 'kevin', m: 'happy', t: 'Bienvenida a Los Gatos, Sofía. Toma mi sudadera. Ahora eres de la familia.' },
        { s: 'sofia', m: 'happy', t: '¿Familia...?' },
        { t: 'La palabra sonó extraña. Bonita. Peligrosa.' },
        { s: 'yesi', m: 'angry', t: '(Esto no se va a quedar así, nuevecita...)', fx: 'zoom' },
      ],
    },
  },

  'c1-6': {
    age: 10, weather: 'viento', music: 'carrera',
    phrases: ['Contra el viento', '¡No voltees!', 'Corre aunque duela', '¡Sigue!'],
    before: {
      place: 'barrio', music: 'tension', scroll: 100,
      cast: [['sofia', 300, 'right', 'idle'], ['dani', 620, 'left', 'angry']],
      lines: [
        { t: 'Han pasado semanas. Sofía casi no va a la escuela. Dani la espera en la esquina de siempre.' },
        { s: 'dani', m: 'angry', t: '¡Sofía! Llevo un mes esperándote a las 5. Un mes.' },
        { s: 'sofia', m: 'talk', t: 'Ya no tengo tiempo para carreritas, Dani. Ahora hago parkour de verdad.' },
        { s: 'dani', m: 'talk', t: '¿Con Los Gatos? Se meten a lugares prohibidos, rompen cosas... Kevin no es buena influencia.' },
        { s: 'sofia', m: 'angry', t: '¡Tú no conoces a Kevin! ¡Él sí me entiende!', fx: 'shake' },
        { s: 'dani', m: 'sad', t: '¿Y yo qué? ¿Yo no te entendí todos estos años?' },
        { s: 'sofia', m: 'angry', t: '¡Contigo todo es aburrido! ¡Correr hasta la tienda, la abuela, los consejos...!' },
        { music: 'ruptura' },
        { s: 'dani', m: 'cry', t: '...Entonces vete con ellos. Pero cuando te dejen sola, no vengas a buscarme.' },
        { s: 'sofia', m: 'cry', t: '¡No te voy a buscar NUNCA!', fx: 'shake' },
        { t: 'El viento se llevó la última palabra. Nadie se dio la vuelta.' },
      ],
    },
    after: {
      place: 'barrio', music: 'drama', scroll: 700,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { s: 'sofia', m: 'sad', t: 'No voy a llorar. Los Gatos no lloran.' },
        { s: 'sofia', m: 'cry', t: '...' },
        { t: 'Sofía lloró. Pero corriendo, como decía la abuela de Dani. Así las lágrimas se secan solas.' },
        { t: 'Esa noche, en la casa de al lado, Dani dejó una lámpara encendida en la ventana. Por si acaso.' },
      ],
    },
  },

  'c1-7': {
    age: 12, weather: 'niebla', music: 'perro', correRate: 0.7,
    phrases: ['¡Ahí viene!', '¡No te detengas!', '¡Salta!', '¡Más rápido!'],
    before: {
      place: 'prohibida', music: 'gatos', scroll: 300,
      cast: [['sofia', 240], ['kevin', 460, 'left'], ['yesi', 570, 'left'], ['chuy', 670, 'left'], ['brayan', 760, 'left']],
      lines: [
        { t: 'Dos años después. Sofía tiene 12. Es la más rápida de Los Gatos.' },
        { t: 'La niebla cubre la vieja fábrica. En la malla hay un letrero rojo: PROHIBIDO EL PASO.' },
        { s: 'kevin', m: 'talk', t: 'Dicen que adentro hay cobre y fierros que valen buen dinero.' },
        { s: 'sofia', m: 'shock', t: 'Kevin... eso es robar.' },
        { s: 'yesi', m: 'angry', t: 'Ay, la santita. ¿Tienes miedo, nuevecita?' },
        { s: 'kevin', m: 'happy', t: 'Eres la más rápida. Entras, agarras lo que puedas y sales. Confío en ti, Sofía.' },
        { s: 'sofia', m: 'sad', t: '...Lo hago por ti, Kevin.' },
        { music: 'peligro' },
        { t: 'Saltó la malla. Del otro lado, algo gruñó en la niebla.' },
        { enter: 'perro', x: 820, face: 'left' },
        { s: 'perro', t: '¡GRRRRRRRR!', fx: 'shake' },
        { s: 'kevin', m: 'shock', t: '¡Es el perro guardián! ¡Patitas, pa\' qué las quiero!' },
        { exit: 'kevin' }, { exit: 'yesi' }, { exit: 'chuy' }, { exit: 'brayan' },
        { s: 'sofia', m: 'shock', t: '¡Kevin, espérame! ¡KEVIN!', fx: 'zoom' },
      ],
    },
    after: {
      place: 'prohibida', music: 'ruptura', scroll: 1800,
      cast: [['sofia', 360, 'right', 'cry']],
      lines: [
        { t: 'Sofía logró escapar. Con un raspón en la rodilla y el corazón hecho pedazos.' },
        { s: 'sofia', m: 'cry', t: '¿Kevin...? ¿Yesi...? ¿Chuy...?' },
        { t: 'Nadie. La dejaron sola con el perro.' },
        { enter: 'kevin', x: 620, face: 'left' },
        { s: 'kevin', m: 'talk', t: 'Eh... qué bueno que saliste. Pero sin el cobre no sirves de nada, flaca.' },
        { s: 'sofia', m: 'angry', t: '¡Me abandonaste! ¡Ese perro casi me muerde!', fx: 'shake' },
        { s: 'kevin', m: 'idle', t: 'Así es la calle. Cada gato se salva solo.' },
        { exit: 'kevin' },
        { s: 'sofia', m: 'cry', t: '¡¿Y la familia?! ¡Dijiste que éramos FAMILIA!', fx: 'zoom' },
        { t: 'Kevin no volteó. La sudadera de Los Gatos, de pronto, pesaba toneladas.' },
      ],
    },
  },

  'c1-8': {
    age: 12, weather: 'frio', music: 'carrera',
    phrases: ['Aunque nadie te espere', '¡Sigue!', 'El hambre no te alcanza', '¡Respira!'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 260, 'right', 'sad'], ['leticia', 620, 'left', 'angry'], ['ramiro', 790, 'left']],
      lines: [
        { t: 'Una patrulla la trajo a casa a las 2 de la mañana.' },
        { s: 'leticia', m: 'angry', t: '¡¿LA POLICÍA?! ¡¿En MI casa?! ¡¿Qué van a decir las vecinas?!', fx: 'shake' },
        { s: 'ramiro', m: 'talk', t: 'Mi princesa no es una delincuente... ¿verdad, princesa? ¿Verdad que no? ¡Hip!' },
        { s: 'sofia', m: 'angry', t: '¡No me digas princesa! ¡Nunca llegaste a ninguna de mis carreras!', fx: 'zoom' },
        { s: 'leticia', m: 'angry', t: '¡No le hables así a tu padre!' },
        { s: 'sofia', m: 'shock', t: '¡¿Ahora sí lo defiendes?!' },
        { s: 'leticia', m: 'angry', t: 'Si quieres vivir en la calle con esos vagos, ¡vive en la calle! Esta casa no es hotel.' },
        { music: 'drama' },
        { t: 'Desde esa noche, Sofía solo volvía a casa a dormir. A veces, ni eso.' },
        { t: 'Y en la mesa ya nadie le servía plato.' },
      ],
    },
    after: {
      place: 'noche', music: 'soledad', scroll: 900,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { s: 'sofia', m: 'sad', t: '*grrr*... Mi estómago ruge más fuerte que el perro de la fábrica.' },
        { s: 'sofia', m: 'sad', t: 'Tres días sin comer bien. Sin Los Gatos, sin mamá, sin papá...' },
        { s: 'sofia', m: 'cry', t: '...Sin Dani.' },
        { t: 'En la casa de al lado, una lámpara seguía encendida. Sofía no la vio.' },
      ],
    },
  },

  'c1-9': {
    age: 12, weather: 'lluvia', music: 'carrera',
    phrases: ['¡Hasta la casa de Dani!', 'La lluvia grande sí moja', 'Que Dani lave los platos', '¡Vamos!'],
    before: {
      place: 'noche', music: 'soledad', scroll: 1300,
      cast: [['sofia', 320, 'right', 'sad']],
      lines: [
        { t: 'Llueve a cántaros. Sofía se esconde bajo el techito de la tienda.' },
        { s: 'sofia', m: 'sad', t: 'Ni modo. Esta noche duermo aquí.' },
        { t: 'De pronto, la lluvia dejó de caerle encima. Alguien sostenía un paraguas amarillo.' },
        { enter: 'dani', x: 460, face: 'left' },
        { music: 'reencuentro' },
        { s: 'dani', m: 'talk', t: 'La lluvia grande sí moja. Eso no lo dice mi abuela, lo digo yo.' },
        { s: 'sofia', m: 'shock', t: '¿D-Dani...?', fx: 'zoom' },
        { s: 'dani', m: 'happy', t: 'Dejé la lámpara prendida dos años. Mi mamá ya me quería cobrar la luz.' },
        { s: 'sofia', m: 'cry', t: 'Dani... te dije cosas horribles. Te dije que contigo todo era aburrido...' },
        { s: 'dani', m: 'talk', t: 'Por eso traje tamales. Los tamales nunca son aburridos.' },
        { s: 'sofia', m: 'cry', t: '*snif* ...¿Me perdonas?' },
        { s: 'dani', m: 'happy', t: 'Te perdoné el mismo día. Solo estaba esperando que corrieras de regreso.' },
        { s: 'dani', m: 'cheer', t: '¡Una carrera hasta mi casa! El que llegue al último lava los platos.' },
        { s: 'sofia', m: 'happy', t: '¡Ja! Ve preparando el jabón, Dani.' },
      ],
    },
    after: {
      place: 'noche', music: 'alegre', weather: 'llovizna', scroll: 1700,
      cast: [['sofia', 300, 'right', 'happy'], ['dani', 440, 'left']],
      lines: [
        { t: 'Esa noche, Sofía cenó caliente por primera vez en semanas.' },
        { s: 'dani', m: 'talk', t: 'Oye... mira este volante. Estaba pegado en un poste.' },
        { t: '«GRAN CARRERA DE PARKOUR DEL BARRIO. PRIMER LUGAR: 5,000 PESOS».', fx: 'flash' },
        { s: 'sofia', m: 'shock', t: '¡¿Cinco mil pesos?! ¡Eso es comida para... para siempre!' },
        { s: 'dani', m: 'happy', t: 'Para unos meses, si no compras puros tamales. ¿Te inscribes?' },
        { s: 'sofia', m: 'angry', t: 'No me inscribo, Dani. Gano.', fx: 'zoom' },
      ],
    },
  },

  'c1-10': {
    age: 12, weather: 'sol', music: 'final', correRate: 0.7,
    phrases: ['¡Por la comida!', '¡Primer lugar!', '¡Que no te alcancen!', '¡Dani te está gritando!'],
    before: {
      place: 'carrera', music: 'tension', scroll: 200,
      cast: [['sofia', 260], ['dani', 370, 'right', 'cheer'], ['kevin', 640, 'left'], ['yesi', 750, 'left']],
      lines: [
        { t: 'Domingo. Unidad deportiva. Cientos de personas. Un premio de cinco mil pesos.' },
        { s: 'kevin', m: 'talk', t: 'Vaya, vaya. La gatita volvió. ¿Vienes a perder?' },
        { s: 'yesi', m: 'angry', t: 'Sin Los Gatos no eres nadie, nuevecita.' },
        { s: 'sofia', m: 'angry', t: 'Ya no soy gata, Kevin. Soy Sofía. Y tengo hambre.', fx: 'zoom' },
        { s: 'dani', m: 'cheer', t: '¡Y yo soy su porra oficial! ¡Hasta traje cartulina!' },
        { music: 'final' },
        { t: 'Sofía se agachó en la línea de salida. Esta vez no corría para huir. Corría para comer.' },
      ],
    },
    after: {
      place: 'carrera', music: 'victoria', scroll: 1600,
      cast: [['sofia', 380, 'right', 'cheer'], ['dani', 260, 'right', 'cheer'], ['kevin', 680, 'left', 'sad']],
      lines: [
        { t: '¡PRIMER LUGAR: SOFÍA!', fx: 'flash' },
        { s: 'dani', m: 'cheer', t: '¡GANASTE! ¡GANASTE! ¡Me voy a quedar sin voz otra vez!' },
        { s: 'kevin', m: 'sad', t: '...Corres más rápido que cualquier gato, Sofía.' },
        { s: 'sofia', m: 'talk', t: 'Ya no cargo con nadie que me deje atrás, Kevin. Por eso vuelo.' },
        { s: 'sofia', m: 'happy', t: 'Dani... ¿vamos por tamales? Esta vez invito yo.' },
        { s: 'dani', m: 'cheer', t: '¡Esta vez sí llego primero a la tienda!' },
        { t: 'Fin del capítulo 1: «Me llamo Sofía».' },
      ],
    },
  },

  // Secreto: cronológicamente entre el nivel 8 y el 9.
  'c1-s': {
    age: 12, weather: 'calor', music: 'secreto', correRate: 0.7,
    phrases: ['¡Que no te atrapen!', '¡Esquiva los puestos!', '¡No sueltes el pan!', '¡Por aquí!'],
    before: {
      place: 'mercado', music: 'secreto', scroll: 300,
      cast: [['sofia', 300, 'right', 'sad'], ['panadero', 640, 'left', 'talk']],
      lines: [
        { t: 'Entre el hambre y la lluvia. Mercado municipal, mediodía. El olor a pan recién hecho es casi cruel.' },
        { s: 'sofia', m: 'sad', t: 'Solo uno... nadie se va a dar cuenta de UN bolillo...' },
        { s: 'panadero', m: 'talk', t: '¡Conchas, bolillos, orejas! ¡Pásele, pásele, marchanta!' },
        { t: 'Sofía estiró la mano...' },
        { s: 'panadero', m: 'angry', t: '¡EY! ¡Esa niña se lleva mi pan! ¡Agárrenla!', fx: 'shake' },
        { s: 'sofia', m: 'shock', t: '¡Ay no, ay no, ay no!', fx: 'zoom' },
      ],
    },
    after: {
      place: 'mercado', music: 'soledad', scroll: 1400,
      cast: [['sofia', 420, 'right', 'sad']],
      lines: [
        { s: 'sofia', m: 'shock', t: '*jadeo*... Lo logré...' },
        { t: 'Se sentó detrás de los puestos. El bolillo todavía estaba tibio.' },
        { s: 'sofia', m: 'cry', t: 'Perdón, señor del pan. Perdón, mamá. Perdón... a mí.' },
        { t: 'Fue el pan más rico y más triste de su vida.' },
      ],
    },
  },
};
