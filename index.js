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
        const tasks = await pool.query(`SELECT id, title, year_date AS year, month_date AS month, day_date AS day, points FROM todos WHERE assigned = $1`, [userEmail])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//get all tasks today
app.get('/gettaskstoday/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params;
    let d = new Date()
    d.setTime( d.getTime() + 3600000 )
    let todayday = d.getDate()
    try {
        const tasks = await pool.query(`SELECT id, title, year_date AS year, month_date AS month, day_date AS day, points FROM todos WHERE assigned = $1 AND day_date = $2`, [userEmail, todayday])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//get all tasks today
app.get('/gettasksincoming/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params;
    let d = new Date()
    d.setTime( d.getTime() + 3600000 )
    let todayday = d.getDate()
    try {
        const tasks = await pool.query(`SELECT id, title, year_date AS year, month_date AS month, day_date AS day, points FROM todos WHERE assigned = $1 AND day_date > $2 LIMIT 10`, [userEmail, todayday])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//get groupname
app.get('/getgroupname/:groupId', async (req, res) => {
    
    const { groupId } = req.params;
    
    try {
        const groupName = await pool.query(`SELECT name FROM groups WHERE id = $1`, [groupId])
        res.json(groupName.rows)
    } catch (err){
        console.error(err)
    }
})

//get todaytaskuser
app.post('/gettodaytaskuser/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params
    const { groupId } = req.body;
    let d = new Date() 
    d.setTime( d.getTime() + 3600000 )
    try {
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const tasks = await pool.query(`SELECT id, title, year_date, month_date, day_date, points, whoassigned FROM todos_groups WHERE assignedto = $1 AND group_id = $2 AND day_date = $3 AND month_date = $4 AND year_date = $5 AND finished = false`, [userEmail, groupId, day, month, year])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//today task user
app.post('/finishtaskgroup/:taskId', async (req, res) => {

    const {taskId} = req.params
    
    try {
        const changeTaskToAccept = await pool.query(`UPDATE todos_groups SET finished= true WHERE id = $1`, [taskId])
        res.json(changeTaskToAccept)
    } catch (err){
        console.error(err)
    }
})

//get all tasks group single user
app.post('/gettasksgroupuser', async (req, res) => {

    const {userEmail, groupId} = req.body
    
    try {
        const tasks = await pool.query(`SELECT id, title, year_date, month_date, day_date, points, whoassigned FROM todos_groups WHERE assignedto = $1 AND group_id = $2`, [userEmail, groupId])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//get all tasks today
app.post('/getincominggrouptasks/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params;
    const {groupId} = req.body
    let d = new Date()
    d.setTime( d.getTime() + 3600000 )
    try {
        const tasks = await pool.query(`SELECT id, title, year_date, month_date, day_date , points, whoassigned FROM todos_groups WHERE assignedto = $1 AND group_id = $2 AND s_date > $3 LIMIT 10`, [userEmail, groupId, d])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//delete tasks group single user
app.delete('/accepttask/:taskId', async (req, res) => {

    const {taskId} = req.params
    console.log(taskId)
    try {
        const tasks = await pool.query(`DELETE FROM todos_groups WHERE id = $1`, [taskId])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//get all tasks group single user to finish
app.get('/getfinishedtasks/:groupId', async (req, res) => {
    const {groupId} = req.params
    try {
        const tasks = await pool.query(`SELECT id, title, year_date, month_date, day_date, points, whoassigned FROM todos_groups WHERE  group_id = $1 AND finished = true`, [ groupId])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//get all tasks group from all users
app.get('/gettasksgroupallusers/:groupId', async (req, res) => {

    const {groupId} = req.params
    
    try {
        const tasks = await pool.query(`SELECT id, title, year_date, month_date, day_date, points, whoassigned, assignedto FROM todos_groups WHERE group_id = $1`, [groupId])
        res.json(tasks.rows)
    } catch (err){
        console.error(err)
    }
})

//create a new task group
app.post('/createtaskgroup', async (req, res) => {
    const {title, userEmail, points, dateend, groupId, targetEmail} = req.body
    const id = v4()
    let d = new Date(dateend) 
    d.setTime( d.getTime() + 3600000 )
    try{
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const newTask = await pool.query(`INSERT INTO todos_groups(id, whoassigned, title, day_date, month_date, year_date, points, s_date, group_id, assignedto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [id, userEmail, title, day, month, year, points, d, groupId, targetEmail])
        res.json(newTask)
    }catch(err){
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

//delete task group
app.delete('/deletetaskgroup/:taskId', async(req, res) => {
    const {taskId} = req.params
    try{
        const deleteTask = await pool.query('DELETE FROM todos_groups WHERE id = $1', [taskId])
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
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const newTask = await pool.query(`INSERT INTO todos(id, assigned, title, day_date, month_date, year_date, points, s_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, email, title, day, month, year, points, d])
        res.json(newTask)
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

//get specific dates tasks
app.post('/dates/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params
    const { dates } = req.body
    const fixed_dates = []
    dates.forEach(date => {
        let d = new Date(date) 
        d.setTime( d.getTime() + 3600000 )
        fixed_dates.push(d)
    });
    try{
        const specificTasks = await pool.query(`SELECT id, title, year_date AS year, month_date AS month, day_date AS day, points FROM todos WHERE assigned = $1 AND s_date = ANY ($2)`, [userEmail, fixed_dates])
        res.json(specificTasks.rows)
    }catch(err){
        console.error(err)
    }
})

//get specific dates tasks groups all
app.post('/datesgroupsall/:groupId', async (req, res) => {
    
    const { groupId } = req.params
    const { dates} = req.body
    const fixed_dates = []
    dates.forEach(date => {
        let d = new Date(date) 
        d.setTime( d.getTime() + 3600000 )
        fixed_dates.push(d)
    });
    fixed_dates.sort()
    try{
        const specificTasks = await pool.query(`SELECT id, title, year_date, month_date, day_date, points, whoassigned, assignedto FROM todos_groups WHERE group_id = $1 AND s_date = ANY ($2)`, [groupId, fixed_dates])
        res.json(specificTasks.rows)
    }catch(err){
        console.error(err)
    }
})

//get specific dates tasks groups single
app.post('/datesgroupssingle/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params
    const { dates, groupId } = req.body
    const fixed_dates = []
    dates.forEach(date => {
        let d = new Date(date) 
        d.setTime( d.getTime() + 3600000 )
        fixed_dates.push(d)
    });
    fixed_dates.sort()
    try{
        const specificTasks = await pool.query(`SELECT id, title, year_date, month_date, day_date, points, whoassigned FROM todos_groups WHERE assignedto = $1 AND s_date = ANY ($2) AND group_id = $3`, [userEmail, fixed_dates, groupId])
        res.json(specificTasks.rows)
    }catch(err){
        console.error(err)
    }
})


//GROUPS

//create a new group
app.post('/group', async (req, res) => {
    const {group_name, email} = req.body
    const id = v4()
    try{
        const newGroup = await pool.query(`INSERT INTO groups(id, name) VALUES ($1, $2)`, [id, group_name])
        const addGroupOwner = await pool.query(`INSERT INTO user_in_groups(group_id, user_email, isAdmin) VALUES ($1, $2, true)`, [id, email])
        res.json(newGroup)
        res.json(addGroupOwner)
    }catch(err){
        console.error(err)
    }
})

//join to group
app.post('/groupjoin', async (req, res) => {
    const {groupId, email} = req.body
    try{
        const addInvite = await pool.query(`INSERT INTO invites(user_email, group_id) VALUES ($1, $2)`, [email, groupId])
        res.json(addInvite)
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

//get all user in group
app.get('/groupusers/:groupId', async (req, res) => {

    const { groupId } = req.params;
    try {
        const groups = await pool.query(`SELECT DISTINCT user_email, isadmin FROM user_in_groups WHERE group_id = $1`, [groupId])
        res.json(groups.rows)
    } catch (err){
        console.error(err)
    }
})

//delete a group
app.delete('/deletegroup/:groupID', async(req, res) => {
    const {groupID} = req.params
    try{
        const deleteFromGroupConnects = await pool.query('DELETE from user_in_groups WHERE group_id = $1', [groupID])
        const deleteFromInvites = await pool.query('DELETE from invites WHERE group_id = $1', [groupID])
        const deleteFromGroup = await pool.query('DELETE FROM groups WHERE id = $1', [groupID])
        res.json(deleteFromGroup)
    }catch(err){
        console.error(err)
    }
})

//remove user
app.delete('/removeuser/', async(req, res) => {
    const {groupId, email} = req.body
    try{
        const deleteFromGroupConnects = await pool.query('DELETE from user_in_groups WHERE group_id = $1 AND user_email = $2', [groupId, email])
        res.json(deleteFromGroupConnects)
    }catch(err){
        console.error(err)
    }
})


//INVITES

//get invites

app.get('/invites/:userEmail', async (req, res) => {

    const { userEmail } = req.params;
    try {
        const invites = await pool.query(`SELECT DISTINCT groups.id, groups.name FROM groups INNER JOIN invites ON groups.id = invites.group_id INNER JOIN users ON users.email = invites.user_email WHERE invites.user_email = $1`, [userEmail])
        res.json(invites.rows)
    } catch (err){
        console.error(err)
    }
})

//accept invite

//join to group
app.put('/acceptinvite', async (req, res) => {
    const {groupId, email} = req.body
    try{
        const removeInvite = await pool.query(`DELETE FROM invites WHERE user_email = $1 AND group_id = $2`,[email, groupId])
        const addMember = await pool.query(`INSERT INTO user_in_groups(user_email, group_id, isAdmin) VALUES ($1, $2, false)`, [email, groupId])
        res.json(addMember)
    }catch(err){
        console.error(err)
    }
})

//decline invite

app.delete('/declineinvite', async (req, res) => {
    const {groupId, email} = req.body
    try{
        const removeInvite = await pool.query(`DELETE FROM invites WHERE user_email = $1 AND group_id = $2`,[email, groupId])
        res.json(removeInvite)
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
        const signUp = await pool.query('INSERT INTO users (email, hashed_password) VALUES ($1, $2)',[email, hashedPassword])

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

        const success = await bcrypt.compare(password, users.rows[0].hashed_password)
        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'})

        if(success) {
            res.json({'email': users.rows[0].email, token})
        }else{
            res.status(400).send(new Error('Niepoprawne dane'))
        }
    }catch(err){
        res.status(400).send(new Error('Niepoprawne dane'))
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

//get unfinished objectives group
app.get('/unfinishedobjectivesgroup/:groupId', async (req, res) => {

    const { groupId } = req.params;
    
    try {
        const groups = await pool.query(`SELECT id, title, max_points, current_points FROM objectives_groups  WHERE group_id = $1 AND isFinished = 'no'`, [groupId])
        res.json(groups.rows)
    } catch (err){
        console.error(err)
    }
})

//get finished objectives group
app.get('/finishedobjectivesgroup/:groupId', async (req, res) => {

    const { groupId } = req.params;
    
    try {
        const groups = await pool.query(`SELECT id, title, max_points, current_points FROM objectives_groups WHERE group_id = $1 AND isFinished = 'yes'`, [groupId])
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

//create objective
app.post('/createobjectivegroup', async (req, res) => {
    const {title, min_points, max_points, groupId} = req.body
    const id = v4()
    try{
        const newObjective = await pool.query(`INSERT INTO objectives_groups (id, title, min_points, max_points, current_points, isFinished, group_id) VALUES ($1, $2, $3, $4, $3, 'false', $5)`, [id,title, min_points, max_points, groupId])
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

//change group name
app.put('/changegroupname/:groupId', async(req, res) => {
    const { groupId } = req.params
    const { groupName } = req.body
    try{
        const changeGroupName = await pool.query('UPDATE groups SET name = $1 WHERE id = $2', [groupName, groupId])
        res.json(changeGroupName)
    }catch(err){
        console.err(err)
    }
})

//get permision group
app.post('/getpermission/:userEmail', async (req, res) => {
    const { userEmail } = req.params
    const { groupId } = req.body
    try{
        const getPermission = await pool.query(`SELECT isAdmin from user_in_groups WHERE user_email = $1 AND group_id = $2`, [userEmail, groupId])
        res.json(getPermission.rows[0].isadmin)
    }catch(err){
        console.error(err)
    }
})

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
)
