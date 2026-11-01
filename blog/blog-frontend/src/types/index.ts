export interface User{
  id:number;
  username:string;
  email:string;
  avatar?:string;
}

export interface PostItem{
  id:number;
  title:string;
  content:string;
  cover?:string;
  tags:string[];
  category:number;
  author_id:number;
  author_name:string;
  views:number;
  is_top:0|1;
  created_at:string;
}
