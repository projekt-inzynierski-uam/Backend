import express from 'express'
import cors from 'cors'
import pool from './db.js'
import {v4} from 'uuid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const PORT = process.env.PORT || 5000
const app = express();
const corsConfig = {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH', 'PUT', 'HEAD'],
    headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}

app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use(express.json())

//TODOS

//get all tasks
app.get('/gettasks/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params;
    
    try {
        const tasks = await pool.query('SELECT * FROM todos WHERE assigned = $1', [userEmail])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//finishtask
app.put('/finishtask/:userEmail', async(req, res) => {
    const {userEmail} = req.params
    const {points} = req.body
    try{
        const objectiveId = await pool.query(`SELECT objectives.id FROM objectives INNER JOIN active_objective ON objectives.id = active_objective.objective_id WHERE user_email = $1`, [userEmail])
        let { id } = objectiveId.rows[0]
        const editObjective = await pool.query('UPDATE objectives SET current_points = current_points + $1 WHERE id = $2', [points,id])
        res.json(editObjective)
    }catch(err){
        console.error(err)
    }
})

//delete task
app.delete('/deletetask/:taskId', async(req, res) => {
    const {taskId} = req.params
    try{
        const deleteTask = await pool.query('DELETE FROM todos WHERE id = $1', [taskId])
        res.json(deleteTask)
    }catch(err){
        console.error(err)
    }
})

//create a new task
app.post('/createtask', async (req, res) => {
    const {title, email, points, dateend} = req.body
    const id = v4()
    let d = new Date(dateend) 
    d.setTime( d.getTime() + 3600000 )
    try{
        const newTask = await pool.query(`INSERT INTO todos(id, assigned, title, finish_date, points) VALUES ($1, $2, $3, $4, $5)`, [id, email, title, d, points])
        res.json(newTask)
    }catch(err){
        console.error(err)
    }
})

//create a new task
app.post('/createtask', async (req, res) => {
    const {title, email, datestart, dateend} = req.body
    const id = v4()
    try{
        console.log(title, email, datestart, dateend)
    }catch(err){
        console.error(err)
    }
})

//edit a todo
app.put('/todos/:id', async(req, res) => {
    const {id} = req.params
    const {title} = req.body
    try{
        const editToDo = await pool.query('UPDATE todos SET title = $1 WHERE id = $2', [title, id])
        res.json(editToDo)
    }catch(err){
        console.error(err)
    }
})

//delete a todo
app.delete('/todos/:id', async(req, res) => {
    const {id} = req.params
    try{
        const deleteToDo = await pool.query('DELETE FROM todos WHERE id = $1', [id])
        res.json(deleteToDo)
    }catch(err){
        console.error(err)
    }
})

//GROUPS

//create a new group
app.post('/group', async (req, res) => {
    const {group_name, user_email} = req.body
    const id = v4()
    try{
        const newGroup = await pool.query(`INSERT INTO groups(id, name) VALUES ($1, $2)`, [id, group_name])
        const addGroupOwner = await pool.query(`INSERT INTO user_in_groups(group_id, user_email) VALUES ($1, $2)`, [id, user_email])
        res.json(newGroup)
        res.json(addGroupOwner)
    }catch(err){
        console.error(err)
    }
})

//join to group
app.post('/groupjoin', async (req, res) => {
    const {group_name, user_email} = req.body
    const group_id = await pool.query(`SELECT id FROM groups WHERE name = $1`, [group_name])
    const {id} = group_id.rows[0]
    try{
        const addGroupMember = await pool.query(`INSERT INTO user_in_groups(group_id, user_email) VALUES ($1, $2)`, [id, user_email])
        res.json(addGroupMember)
    }catch(err){
        console.error(err)
    }
})

//get all groups
app.get('/groups/:userEmail', async (req, res) => {

    const { userEmail } = req.params;
    
    try {
        const groups = await pool.query(`SELECT DISTINCT groups.id, groups.name FROM groups INNER JOIN user_in_groups ON groups.id = user_in_groups.group_id INNER JOIN users ON users.email = user_in_groups.user_email WHERE user_email = $1`, [userEmail])
        res.json(groups.rows)
    } catch (err){
        console.error(err)
    }
})

//delete a group
app.delete('/groups/:groupID', async(req, res) => {
    const {groupID} = req.params
    try{
        const deleteFromGroupConnects = await pool.query('DELETE from user_in_groups WHERE group_id = $1', [groupID])
        const deleteFromGroup = await pool.query('DELETE FROM groups WHERE id = $1', [groupID])
        res.json(deleteFromGroupConnects)
        res.json(deleteFromGroup)
    }catch(err){
        console.error(err)
    }
})

//LOGIN REGISTER

//signup

app.post('/signup', async (req, res) =>{
    const {email, password} = req.body
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)
    try{
        const signUp = await pool.query('INSERT INTO users (email, hashed_password) VALUES ($1, $2)',
        [email, hashedPassword])

        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'})

        res.json({email, token})
    }catch(err){
        console.error(err)
        if(err){
            res.json({detail: err.detail})
        }
    }
})

//login

app.post('/login', async (req, res) =>{
    const {email, password} = req.body
    try{
        const users = await pool.query('SELECT * FROM users WHERE email = $1',[email])

        if(!users.rows.length) return res.json({detail: 'Użytkownik nie istnieje'})

        const success = await bcrypt.compare(password, users.rows[0].hashed_password)
        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'})

        if(success) {
            res.json({'email': users.rows[0].email, token})
        }else{
            res.json({detail: "Nie udało się zalogować"})
        }
    }catch(err){
        console.error(err)
    }
})

//Objectives 

//get active objective
app.get('/activeobjective/:userEmail', async (req, res) => {

    const { userEmail } = req.params;
    
    try {
        const isActiveObjectiveExist = await pool.query(`SELECT EXISTS(SELECT * FROM active_objective WHERE user_email = $1)`, [userEmail])
        let { exists } = isActiveObjectiveExist.rows[0]
        if(!exists){
            const createActiveObjective = await pool.query(`INSERT INTO active_objective (objective_id, user_email) VALUES ('test', $1)`, [userEmail])
        }
        const getActiveObjectives = await pool.query(`SELECT objectives.id, objectives.title, objectives.max_points, objectives.current_points FROM objectives INNER JOIN active_objective ON objectives.id = active_objective.objective_id WHERE user_email = $1`, [userEmail])
        res.json(getActiveObjectives.rows)
    } catch (err){
        console.error(err)
    }
})

//edit active objective

app.put('/editactiveobjective/:userEmail', async(req, res) => {
    const {userEmail} = req.params
    const {id} = req.body
    try{
        const editActiveObjective = await pool.query('UPDATE active_objective SET objective_id = $1 WHERE user_email = $2', [id, userEmail])
        res.json(editActiveObjective)
    }
    catch(err){
        console.error(err)
    }
})

//get unfinished objectives
app.get('/unfinishedobjectives/:userEmail', async (req, res) => {

    const { userEmail } = req.params;
    
    try {
        const groups = await pool.query(`SELECT objectives.id, objectives.title, objectives.max_points, objectives.current_points FROM objectives INNER JOIN users_objectives_connection ON objectives.id = users_objectives_connection.objective_id INNER JOIN users ON users.email = users_objectives_connection.user_email WHERE user_email = $1 AND isFinished = 'no' `, [userEmail])
        res.json(groups.rows)
    } catch (err){
        console.error(err)
    }
})

//get finished objectives
app.get('/finishedobjectives/:userEmail', async (req, res) => {

    const { userEmail } = req.params;
    
    try {
        const groups = await pool.query(`SELECT objectives.id, objectives.title, objectives.max_points, objectives.current_points FROM objectives INNER JOIN users_objectives_connection ON objectives.id = users_objectives_connection.objective_id INNER JOIN users ON users.email = users_objectives_connection.user_email WHERE user_email = $1 AND isFinished = 'yes' `, [userEmail])
        res.json(groups.rows)
    } catch (err){
        console.error(err)
    }
})

//create objective
app.post('/createobjective', async (req, res) => {
    const {title, min_points, max_points, email} = req.body
    const id = v4()
    try{
        const newObjective = await pool.query(`INSERT INTO objectives (id, title, min_points, max_points, current_points, isFinished) VALUES ($1, $2, $3, $4, $3, 'false')`, [id,title, min_points, max_points])
        const newConnection = await pool.query(`INSERT INTO users_objectives_connection (objective_id, user_email) VALUES ($1, $2)`, [id, email])
        res.json(newObjective)
        res.json(newConnection)
    }catch(err){
        console.error(err)
    }
})

//edit objective

app.put('/editobjective/:objectiveid', async(req, res) => {
    const {objectiveid} = req.params
    const {title, current_points, max_points} = req.body
    try{
        const editObjective = await pool.query('UPDATE objectives SET title = $1, current_points = $2, max_points = $3 WHERE id = $4', [title, current_points, max_points, objectiveid])
        res.json(editObjective)
    }catch(err){
        console.error(err)
    }
})

//edit unfinished to finished objective
app.put('/editobjectivetofinished/:objectiveid', async(req, res) => {
    const {objectiveid} = req.params
    try{
        const editObjective = await pool.query(`UPDATE objectives SET isFinished = 'yes' WHERE id = $1`, [objectiveid])
        res.json(editObjective)
    }catch(err){
        console.error(err)
    }
})

//delete finished objective
app.delete('/deleteobjective/:objectiveid', async(req, res) => {
    const {objectiveid} = req.params
    try{
        const deleteObjectiveConnection = await pool.query('DELETE FROM users_objectives_connection WHERE objective_id = $1', [objectiveid])
        const deleteObjective = await pool.query('DELETE FROM objectives WHERE id = $1', [objectiveid])
        res.json(deleteObjectiveConnection)
        res.json(deleteObjective)
    }catch(err){
        console.error(err)
    }
})

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
)
