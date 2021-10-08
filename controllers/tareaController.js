const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const {validationResult} = require('express-validator');


//crea una nueva tarea
exports.crearTarea = async (req,res) => {
    //Revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()})
    }

    //extraer el proyecto y comprobar si existe
    const { proyecto } = req.body;

    try {
        
        const consult = await Proyecto.findById(proyecto.toString());

        if(!consult){
            return res.status(400).json({msg: 'Proyecto no encontrado'});
        }

        //revisar si el proyecto actual pertenece al usuario autenticado
        if(consult.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No Autorizado'})
        }

        //Creamos la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json({ tarea})

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }


}

//obtiene las tareas por proyecto
exports.obtenerTareas = async (req,res) => {
    
    const { proyecto } = req.query;

    try {
    
        const consult = await Proyecto.findById(proyecto.toString());

        if(!consult){
            return res.status(400).json({msg: 'Proyecto no encontrado'});
        }

        //revisar si el proyecto actual pertenece al usuario autenticado
        if(consult.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No Autorizado'})
        }

        //Obtener las tareas por proyecto
        const tareas = await Tarea.find({ proyecto }).sort({creado:-1});
        res.json({tareas})
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}

//actualizar una tarea
exports.actualizarTarea = async (req,res) => {
    const { proyecto, nombre, estado } = req.body;

    try {
        
        //si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id)

        if(!tarea){
            return res.status(404).json({msg:'No existe la tarea'})
        }

        //extraer proyecto
        const consult = await Proyecto.findById(proyecto.toString());


        //revisar si el proyecto actual pertenece al usuario autenticado
        if(consult.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No Autorizado'})
        }

        //crear objeto con la nueva informacion
        const nuevaTarea = {};

        nuevaTarea.nombre = nombre
        nuevaTarea.estado = estado
        
        //guardar la tarea
        tarea = await Tarea.findOneAndUpdate(
            {_id:req.params.id},
            nuevaTarea,
            {new:true}
            );

        res.json(tarea)

        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

//Elimina una tarea
exports.eliminarTarea = async (req,res) => {
    const { proyecto} = req.query;

    try {
        
        //si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id)

        if(!tarea){
            return res.status(404).json({msg:'No existe la tarea'})
        }

        //extraer proyecto
        const consult = await Proyecto.findById(proyecto.toString());


        //revisar si el proyecto actual pertenece al usuario autenticado
        if(consult.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No Autorizado'})
        }

        //eliminar
        await Tarea.findOneAndRemove({_id: req.params.id});
        res.json({msg:'Tarea Eliminada'})

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}