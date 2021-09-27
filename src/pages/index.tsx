import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiUser, FiCalendar } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <main>
      <a>
        <h1>Como utilizar Hooks</h1>
        <p>Pensando em sincronização em vez de ciclos de vida.</p>
        <footer>
          <span>
            <FiCalendar />
            <p>15 Mar 2021</p>
          </span>
          <span>
            <FiUser />
            <p>Joseph Oliveira</p>
          </span>
        </footer>
      </a>
      <a>
        <h1>Como utilizar Hooks</h1>
        <p>Pensando em sincronização em vez de ciclos de vida.</p>
        <footer>
          <span>
            <FiCalendar />
            <p>15 Mar 2021</p>
          </span>
          <span>
            <FiUser />
            <p>Joseph Oliveira</p>
          </span>
        </footer>
      </a>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM y',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
