// Capítulo 3 «El día de mi suerte» (12 años): volver a casa y ver cuánto cambió, reconciliarse
// con Dani, extrañar a Los Gatos aunque duela, perder a su hermano sin darse cuenta, buscar la
// aprobación de sus papás y encontrar en la Tata un refugio. Formato: ver story1.js. 12+.

export const STORY3 = {
  'c3-1': {
    age: 12, weather: 'nublado', music: 'carrera',
    phrases: ['¡Sal de aquí!', 'Ya no es tu casa', '¡Corre!', 'Respira'],
    before: {
      place: 'casa', music: 'ausencia',
      cast: [['sofia', 260, 'right', 'sad'], ['tomas', 440, 'left']],
      lines: [
        { t: 'Sofía tiene 12. Hace meses que casi no duerme en casa. Hoy decidió volver.' },
        { s: 'sofia', m: 'talk', t: 'Hola, Tomás. ¿Y mi cama?' },
        { s: 'tomas', m: 'talk', t: 'Mamá puso ahí las cajas de las gelatinas. Dijo que tú ya no venías.' },
        { s: 'sofia', m: 'sad', t: '...Y quitaron mi dibujo de la pared.' },
        { s: 'tomas', m: 'happy', t: 'Ahora hay un calendario de dinosaurios. ¿Ya viste? Es el mes del triceratops.' },
        { s: 'sofia', m: 'sad', t: 'Sí... está bonito.' },
        { t: 'La casa era la misma. Pero ya no tenía forma de Sofía.' },
      ],
    },
    after: {
      place: 'parque', music: 'soledad', scroll: 900,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { t: 'Corrió hasta el parque secreto. Ya no tenía con quién correr ahí.' },
        { s: 'sofia', m: 'sad', t: 'Ni siquiera sé si sigue siendo secreto.' },
      ],
    },
  },

  'c3-2': {
    age: 12, weather: 'despejado', music: 'carrera',
    phrases: ['No llores', '¡Sigue!', 'Ya pasará', '¡Respira!'],
    before: {
      place: 'tienda', music: 'tension',
      cast: [['sofia', 260, 'right', 'sad'], ['dani', 560, 'left'], ['tata', 740, 'left']],
      lines: [
        { s: 'sofia', m: 'talk', t: 'Dani... hola.' },
        { s: 'dani', m: 'idle', t: 'Buenas tardes. ¿Qué va a llevar?' },
        { s: 'sofia', m: 'sad', t: 'Dani, soy yo.' },
        { s: 'dani', m: 'idle', t: 'Ya sé quién eres. Por eso te pregunto qué vas a llevar. Para que te vayas rápido.' },
        { s: 'tata', m: 'sad', t: 'Daniel...' },
        { s: 'dani', m: 'angry', t: 'Abuela, por favor.' },
        { s: 'sofia', m: 'sad', t: '...Un agua, por favor.' },
      ],
    },
    after: {
      place: 'barrio', music: 'drama', scroll: 700,
      cast: [['sofia', 300, 'right', 'sad'], ['tata', 560, 'left']],
      lines: [
        { s: 'tata', m: 'talk', t: 'Mija, espérate.' },
        { s: 'sofia', m: 'sad', t: 'No se preocupe, Tata. Ya entendí.' },
        { s: 'tata', m: 'talk', t: 'No entendiste nada. Ese niño no está enojado. Está triste. Y eso no se le quita gritando.' },
        { t: 'Sofía no supo qué contestar. Así que corrió.' },
      ],
    },
  },

  'c3-3': {
    age: 12, weather: 'viento', music: 'carrera',
    phrases: ['No eres tonta', '¡Sigue!', 'Paso a paso', 'Corre y piensa'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 250, 'right', 'sad'], ['leticia', 600, 'left', 'angry'], ['ramiro', 770, 'left']],
      lines: [
        { s: 'leticia', m: 'angry', t: '¡Reprobaste cuatro materias, Sofía! ¡CUATRO!', fx: 'shake' },
        { s: 'ramiro', m: 'talk', t: 'Bueno, Leti... por lo menos no fueron cinco.' },
        { s: 'leticia', m: 'angry', t: '¡Tú cállate, Ramiro!' },
        { s: 'sofia', m: 'sad', t: 'Es que no entiendo nada. Me salté muchas clases por andar con Los Gatos... ya no me acuerdo de nada.' },
        { s: 'sofia', m: 'cry', t: 'Me siento tonta. Y lenta.' },
        { music: 'ruptura' },
        { s: 'leticia', m: 'idle', t: 'Pues así has de estar: lenta para la escuela y rápida para la calle.' },
      ],
    },
    after: {
      place: 'barrio', music: 'soledad', scroll: 1200,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { s: 'sofia', m: 'sad', t: 'Antes era rápida para algo. Ahora ni para eso.' },
        { t: 'Le dolían las piernas. Pero le dolía más la cabeza.' },
      ],
    },
  },

  'c3-4': {
    age: 12, weather: 'niebla', music: 'gatos',
    phrases: ['¿Por qué regresas?', '¡Vete de ahí!', 'Ya no es tu lugar', '¡Sigue!'],
    before: {
      place: 'prohibida', music: 'gatos', scroll: 400,
      cast: [['sofia', 260, 'right', 'sad'], ['chuy', 560, 'left'], ['yesi', 680, 'left', 'angry']],
      lines: [
        { s: 'sofia', m: 'talk', t: 'Chuy... ¿Kevin anda por aquí?' },
        { s: 'chuy', m: 'sad', t: 'Ráfaga... no deberías estar aquí.' },
        { s: 'yesi', m: 'angry', t: '¿Otra vez tú? Ya te dijimos que aquí ya no tienes lugar.' },
        { s: 'sofia', m: 'cry', t: 'Nada más quiero correr con ustedes. Una vez. Como antes.' },
        { s: 'yesi', m: 'angry', t: '«Como antes» ya no existe, niña. Vete.', fx: 'zoom' },
        { t: 'Sofía se fue. Pero al día siguiente volvió a pasar por ahí. Y al siguiente.' },
      ],
    },
    after: {
      place: 'barrio', music: 'soledad', scroll: 1500,
      cast: [['sofia', 440, 'right', 'sad']],
      lines: [
        { s: 'sofia', m: 'sad', t: '¿Por qué sigo regresando? Si ni me quieren ahí.' },
        { t: 'Hay cosas que se extrañan aunque duelan. Sobre todo las que duelen.' },
      ],
    },
  },

  'c3-5': {
    age: 12, weather: 'frio', music: 'carrera',
    phrases: ['¡A la tienda!', 'Hay pan y café', '¡Corre!', 'No estás sola'],
    before: {
      place: 'noche', music: 'soledad', scroll: 500,
      cast: [['sofia', 300, 'right', 'sad']],
      lines: [
        { t: 'Otra vez. Leticia cerró la puerta con llave. «Para que aprendas», dijo.' },
        { s: 'sofia', m: 'sad', t: '...' },
        { enter: 'tata', x: 560, face: 'left' },
        { s: 'tata', m: 'talk', t: 'Mija, ¿otra vez en la banqueta? Ándale, vente a la tienda. Hay café con leche y pan.' },
        { s: 'sofia', m: 'sad', t: 'No quiero darle problemas, Tata. Usted dijo que mi familia era mala influencia.' },
        { s: 'tata', m: 'sad', t: 'Dije muchas tonterías cuando tenías 9 años. A mi edad una tiene derecho a cambiar de opinión.' },
        { s: 'tata', m: 'happy', t: 'Además, el pan se pone duro. Y eso sí es un problema.' },
      ],
    },
    after: {
      place: 'tienda', music: 'reencuentro',
      cast: [['sofia', 320, 'right', 'happy'], ['tata', 560, 'left']],
      lines: [
        { s: 'tata', m: 'talk', t: 'Te tendí el catre de la bodega. Ahí dormía Dani cuando era chiquito, entre los chiles en lata.' },
        { s: 'sofia', m: 'cry', t: 'Gracias, Tata...' },
        { s: 'tata', m: 'happy', t: 'Nada de gracias. Mañana me ayudas a acomodar refrescos. Aquí nadie duerme gratis.' },
        { t: 'Esa noche Sofía durmió como no dormía en años.' },
      ],
    },
  },

  'c3-6': {
    age: 12, weather: 'sol', music: 'carrera',
    phrases: ['Que duela en las piernas', '¡Sigue!', 'Corre', '¡Más lejos!'],
    before: {
      place: 'barrio', music: 'ausencia', scroll: 400,
      cast: [['sofia', 280, 'right', 'happy'], ['tomas', 500, 'left']],
      lines: [
        { s: 'sofia', m: 'happy', t: '¡Tomás! ¿Quieres que te enseñe a correr? Como el tiranosaurio, ¿te acuerdas?' },
        { s: 'tomas', m: 'idle', t: '¿Cuál tiranosaurio? Eso era de chiquito.' },
        { s: 'sofia', m: 'talk', t: 'Tú gritabas «¡RAAAWR!» y yo corría por toda la casa...' },
        { s: 'tomas', m: 'idle', t: 'No me acuerdo. Tú nunca estabas.' },
        { s: 'sofia', m: 'sad', t: '...' },
        { s: 'tomas', m: 'talk', t: 'Ya me voy. Mis amigos me esperan. Ellos sí siempre están.' },
        { exit: 'tomas' },
        { t: 'Sofía se quedó con la mano levantada. Como quien le dice adiós a un camión que ya se fue.' },
      ],
    },
    after: {
      place: 'barrio', music: 'soledad', scroll: 1300,
      cast: [['sofia', 440, 'right', 'cry']],
      lines: [
        { s: 'sofia', m: 'cry', t: 'Lo descuidé. Todo este tiempo... y ni cuenta me di.' },
        { t: 'Corrió. No para huir. Para que doliera en las piernas y no en otro lado.' },
      ],
    },
  },

  'c3-7': {
    age: 12, weather: 'atardecer', music: 'perro', correRate: 0.7,
    phrases: ['¡Alcánzalo!', '¡Dani, espera!', '¡No lo pierdas!', '¡Más rápido!'],
    before: {
      place: 'prohibida', music: 'tension', scroll: 900,
      cast: [['sofia', 260, 'right', 'idle'], ['dani', 560, 'left']],
      lines: [
        { t: 'Poco a poco, Dani volvió a saludarla. Luego a esperarla en el parque. Como antes. Casi.' },
        { t: 'Pero hoy Dani la encontró afuera del deportivo, viendo entrenar a Los Gatos.' },
        { s: 'dani', m: 'sad', t: 'Ahí estás otra vez.' },
        { s: 'sofia', m: 'shock', t: '¡Dani! No es lo que piensas, yo nada más...' },
        { s: 'dani', m: 'cry', t: 'Siempre es lo que pienso. Siempre vas a regresar con ellos. Y yo siempre voy a ser el segundo lugar.' },
        { s: 'dani', m: 'cry', t: 'Pensé que eso no me importaba. Pero sí me importa.', fx: 'zoom' },
        { exit: 'dani' },
        { s: 'sofia', m: 'shock', t: '¡Dani! ¡Espérame!' },
      ],
    },
    after: {
      place: 'parque', music: 'reencuentro', scroll: 1700,
      cast: [['sofia', 380, 'right', 'cry'], ['dani', 520, 'left', 'cry']],
      lines: [
        { s: 'sofia', m: 'cry', t: '*jadeo*... Te alcancé...' },
        { s: 'dani', m: 'cry', t: '¿Para qué? ¿Para que me dejes otra vez?' },
        { s: 'sofia', m: 'cry', t: 'Para pedirte perdón. Por los once días. Por todo lo que te dije. Por no ver que siempre estabas.' },
        { s: 'sofia', m: 'talk', t: 'No eres mi segundo lugar, Dani. Eres el único que siempre llega.' },
        { s: 'dani', m: 'sad', t: '...Pensé que me había quedado sin mi mejor amiga.' },
        { s: 'sofia', m: 'happy', t: 'Nunca te quedaste sin ella. Nada más se perdió un rato.' },
      ],
    },
  },

  'c3-8': {
    age: 12, weather: 'calor', music: 'carrera',
    phrases: ['Corre de todos modos', '¡Sigue!', 'No necesitas un «ajá»', '¡Respira!'],
    before: {
      place: 'casa', music: 'tension',
      cast: [['sofia', 250, 'right', 'happy'], ['tomas', 420, 'right'], ['leticia', 680, 'left']],
      lines: [
        { t: 'Sofía limpió toda la casa. Lavó los trastes. Hasta le quitó el polvo a la tele.' },
        { s: 'sofia', m: 'happy', t: 'Mamá, ¿ya viste? Dejé todo limpio.' },
        { s: 'leticia', m: 'idle', t: 'Ajá.' },
        { s: 'leticia', m: 'happy', t: 'Tomás, mi rey, ¿es cierto que sacaste diez en dibujo?' },
        { s: 'tomas', m: 'cheer', t: '¡Dibujé un estegosaurio!' },
        { s: 'leticia', m: 'happy', t: '¡Ay, mi niño tan listo!' },
        { s: 'sofia', m: 'sad', t: '...Mamá, también limpié la estufa.' },
        { s: 'leticia', m: 'idle', t: 'Era tu obligación, Sofía. No esperes aplausos por hacer lo que te toca.' },
        { t: 'A veces lo que más duele no es un grito. Es un «ajá».' },
      ],
    },
    after: {
      place: 'casa', music: 'ausencia',
      cast: [['sofia', 300, 'right', 'sad'], ['ramiro', 620, 'left']],
      lines: [
        { s: 'sofia', m: 'talk', t: 'Papá... ¿tú estás orgulloso de mí?' },
        { s: 'ramiro', m: 'idle', t: '...Claro, princesa. Claro.' },
        { t: 'Ni volteó a verla. Sofía ya sabía distinguir cuando su papá decía algo de verdad.' },
        { t: 'Esta no era una de esas veces.' },
      ],
    },
  },

  // Secreto: entre el 8 y el 9. Su mamá la sacó de la casa y no quiso molestar a la Tata.
  'c3-s': {
    age: 12, weather: 'calor', music: 'secreto', correRate: 0.7,
    phrases: ['¡Que no te atrapen!', '¡Esquiva los puestos!', '¡No sueltes el pan!', '¡Por aquí!'],
    before: {
      place: 'mercado', music: 'secreto', scroll: 300,
      cast: [['sofia', 300, 'right', 'sad'], ['panadero', 640, 'left', 'talk']],
      lines: [
        { t: 'Leticia volvió a cerrar la puerta. Esta vez Sofía no quiso molestar a la Tata.' },
        { t: 'Mercado municipal, mediodía. El olor a pan recién hecho es casi cruel.' },
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

  'c3-9': {
    age: 12, weather: 'llovizna', music: 'carrera',
    phrases: ['¡Entrena!', '¡Dani viene atrás!', 'Sí sirves', '¡Otra vez!'],
    before: {
      place: 'tienda', music: 'alegre',
      cast: [['sofia', 260, 'right', 'sad'], ['dani', 420, 'left', 'talk'], ['tata', 720, 'left']],
      lines: [
        { s: 'dani', m: 'talk', t: 'Mira este volante. Estaba pegado en un poste.' },
        { t: '«GRAN CARRERA DE PARKOUR DEL BARRIO. PRIMER LUGAR: 5,000 PESOS».', fx: 'flash' },
        { s: 'sofia', m: 'sad', t: 'No, Dani. Yo ya no sirvo para eso. Ya ni para correr sirvo.' },
        { s: 'dani', m: 'talk', t: 'Eso lo dice la Sofía triste. Yo quiero hablar con la que corría con un tenis con cinta.' },
        { s: 'tata', m: 'talk', t: 'Cinco mil pesos son muchas gelatinas, mija. Hasta tu mamá tendría que fijarse.' },
        { s: 'sofia', m: 'shock', t: '¿Usted cree que mi mamá se daría cuenta? ¿De que correr no es perder el tiempo?' },
        { s: 'tata', m: 'idle', t: 'Creo que tú te tienes que dar cuenta primero.' },
      ],
    },
    after: {
      place: 'parque', music: 'despertar', scroll: 1500,
      cast: [['sofia', 440, 'right', 'sad'], ['dani', 300, 'right', 'happy']],
      lines: [
        { s: 'sofia', m: 'sad', t: 'Me duelen las piernas... me falta el aire...' },
        { s: 'dani', m: 'happy', t: 'Eso se llama entrenar. Lo leí en el periódico de los huevos.' },
        { s: 'sofia', m: 'happy', t: '¿Todavía tienes ese periódico?' },
        { s: 'dani', m: 'cheer', t: 'Lo enmiqué. Es mi biblia del deporte.' },
      ],
    },
  },

  'c3-10': {
    age: 12, weather: 'sol', music: 'final', correRate: 0.7,
    phrases: ['¡Por ti!', '¡Primer lugar!', '¡Que no te alcancen!', '¡Dani te está gritando!'],
    before: {
      place: 'carrera', music: 'tension', scroll: 200,
      cast: [['sofia', 260, 'right', 'sad'], ['dani', 380, 'right', 'cheer'], ['tata', 160, 'right', 'cheer'], ['kevin', 680, 'left']],
      lines: [
        { t: 'Domingo. Unidad deportiva. Cientos de personas. Un premio de cinco mil pesos.' },
        { s: 'sofia', m: 'sad', t: 'No estoy lista, Dani. Mira a los demás... hasta Kevin se inscribió.' },
        { s: 'kevin', m: 'talk', t: 'Mira nada más. La Ráfaga. ¿Vienes a correr o a llorar?' },
        { s: 'dani', m: 'angry', t: 'Viene a ganarte. Y yo vengo a verlo.' },
        { s: 'tata', m: 'cheer', t: '¡Ándale, mija! ¡Traje cartulina! ¡Dice SOFÍA con diamantina!' },
        { s: 'sofia', m: 'talk', t: 'Por mamá. Para que vea que esto no es una tontería.' },
        { s: 'dani', m: 'happy', t: 'Y por ti, Sofía. Sobre todo por ti.' },
        { music: 'final' },
        { t: '¡En sus marcas... listos... FUERA!', fx: 'flash' },
      ],
    },
    after: {
      place: 'carrera', music: 'victoria', scroll: 1600,
      cast: [['sofia', 400, 'right', 'cheer'], ['dani', 260, 'right', 'cheer'], ['tata', 140, 'right', 'happy'], ['kevin', 700, 'left', 'sad']],
      lines: [
        { t: '¡PRIMER LUGAR: SOFÍA!', fx: 'flash' },
        { s: 'dani', m: 'cheer', t: '¡GANASTE! ¡Te lo dije! ¡Te lo dijo el periódico de los huevos!' },
        { s: 'kevin', m: 'sad', t: '...Corres más rápido que cualquier gato, Ráfaga.' },
        { s: 'sofia', m: 'talk', t: 'Me llamo Sofía, Kevin.' },
        { s: 'tata', m: 'happy', t: 'Esa sí es una medalla de verdad, mija. Ya me pagaste.' },
        { s: 'sofia', m: 'happy', t: 'Ahora sí tengo algo que enseñarle a mi mamá.' },
        { t: 'Fin del capítulo 3: «El día de mi suerte».', fx: 'flash' },
      ],
    },
  },
};
