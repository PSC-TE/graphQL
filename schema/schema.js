const graphql = require('graphql');
const _ = require('lodash');
let {books}= require('../model/book')
let {authors}= require('../model/author')

const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} = graphql;

const BookType = new GraphQLObjectType({
    name : 'Book',
    fields: ()=>({
        id : {type: GraphQLID},
        name : {type: GraphQLString},
        genre : {type: GraphQLString},
        author :{
            type : AuthorType,
            resolve(parent, args){
                console.log(parent);
                return _.find(authors, {id: parent.authorId})
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name : 'Author',
    fields : ()=>({
        id : {type : GraphQLID},
        name : {type :GraphQLString},
        age : {type : GraphQLInt},
        books : {
            type: new GraphQLList(BookType),
            resolve(parent,args){
                console.log(parent);
                return _.filter(books, {authorId: parent.id})
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name : 'RootQueryType',
    fields: {
       book :{
           type : BookType,
           args : {id: {type : GraphQLID}},
           resolve(parent,args){
               //code to get data from db/other sources
            //    args.id
            return _.find(books, {id:args.id})
           }
       },

       author : {
           type : AuthorType,
           args : {id: {type : GraphQLID}},
           resolve(parent, args){
               return _.find(authors, {id:args.id})
           }
       },

       books :{
           type : new GraphQLList(BookType),
           resolve(parent, args){
               return books;
           }
       },

       authors : {
           type : new GraphQLList(AuthorType),
           resolve(parent,args){
               return authors;
           }
       }
        
    }
})

const Mutation = new GraphQLObjectType({
    name : 'Mutation',
    fields : {
        addAuthor : {
            type : AuthorType,
            args: {
                name : {type : GraphQLString},
                age : {type: GraphQLInt}
            },
            resolve(parent, args){
                let author ={
                    name : args.name,
                    age: args.age,
                    id : authors.length+1,
                };
                authors.push(author);
                return author                
            }
        },

        addBook : {
            type : BookType,
            args: {
                name : {type : GraphQLString},
                genre : {type : GraphQLString},
                authorId : {type : GraphQLInt}
            },
            resolve(parent, args){
                let book = {
                    name : args.name,
                    genre: args.genre,
                    id: books.length+1,
                    authorId: args.authorId
                };
                books.push(book);
                return book
            }
        },

        editBook : {
            type : BookType,
            args: {
                id: {type : new GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                genre: {type: GraphQLString}
            },
            resolve(parent, args){
                const indexOfBook = books.findIndex((b)=>b.id ===args.id);
                if (indexOfBook>-1){
                    if(args.name) {books[indexOfBook].name = args.name}
                    if(args.genre) {books[indexOfBook].genre = args.genre}
                }
                return books[indexOfBook];
            }
        },

        deleteBook : {
            type :BookType,
            args :{
                id: {type : new GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                const indexOfBook = books.findIndex((b)=>b.id === args.id);
                if(indexOfBook>-1){
                    const deletedBook= books.splice(indexOfBook, 1)[0];
                    return deletedBook;
                }
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation : Mutation
})