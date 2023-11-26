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

//get all todos
app.get('/todos/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params;
    
    try {
        const todos = await pool.query('SELECT * FROM todos WHERE assigned = $1', [userEmail])
        res.json(todos.rows)
    } catch (err){
        console.error(err)
    }
})

//create a new todo
app.post('/todos', async (req, res) => {
    const {assigned, title} = req.body
    const id = v4()
    try{
        const newToDo = await pool.query(`INSERT INTO todos(id, assigned, title) VALUES ($1, $2, $3)`, [id, assigned, title])
        res.json(newToDo)
    }catch(err){
        console.error(err)
    }
})

//get all todos in group
app.get('/todos-group/:groupID', async (req, res) => {
    
    const { groupID } = req.params;
    
    try {
        const todos = await pool.query('SELECT * FROM todos WHERE assigned = $1', [groupID])
        res.json(todos.rows)
    } catch (err){
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
        const deleteGroup = await pool.query('DELETE FROM groups WHERE id = $1', [groupID])
        res.json(deleteGroup)
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

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
)
